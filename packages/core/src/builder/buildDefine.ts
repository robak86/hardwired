import {
  InstanceDefinition,
  InstancesArray,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import {
  assertValidDependencies,
  assertValidDependency,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { v4 } from 'uuid';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { IContainerScopes } from '../container/IContainer.js';

// TODO:
// we probably don't need Resolution enum
// we probably don't need AsyncDefinition
// - strategies are synchronous. and with the new approach we can just use async functions

// TODO- context provided to defineFn should be aware of the lifeTime of the instance, and should only allow using
//  instances defined by ValidDependenciesLifeTime

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: InstanceDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any>): TValue;
  use<TValue>(
    instanceDefinition: InstanceDefinition<Promise<TValue>, ValidDependenciesLifeTime<TAllowedLifeTime>, any>,
  ): Promise<TValue>;
  use<TValue>(
    instanceDefinition: InstanceDefinition<Promise<TValue> | TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any>,
  ): Promise<TValue> | TValue;

  getAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
}

type CustomBind<
  TBuildIns extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime,
> = {
  lifeTime: TLifeTime;
  include?: TBuildIns;
  after?: <TInstance>(instance: TInstance, meta: TMeta) => TInstance;
  pre?: <TInstance>(def: InstanceDefinition<TInstance, any, any>) => TInstance;
  buildMeta?: (...args: TPreambleArgs) => TMeta;
};

export const buildDefine = <
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime extends LifeTime,
>(
  params: CustomBind<TProvidedBindings, TPreambleArgs, TMeta, TLifeTime>,
) => {
  return <TInstance>(
    ...args: [
      ...TPreambleArgs,
      (
        cnt: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & InstancesRecord<TProvidedBindings>,
      ) => TInstance,
    ]
  ): InstanceDefinition<TInstance, TLifeTime, TMeta> => {
    const defineFn = args.at(-1) as (
      cnt: InstanceCreationAware<TLifeTime> & InstancesRecord<TProvidedBindings>,
    ) => TInstance;
    const preambleArgs = args.slice(0, -1) as TPreambleArgs;
    const meta = params.buildMeta?.(...preambleArgs) as TMeta;

    return new InstanceDefinition<TInstance, TLifeTime, TMeta>(
      v4(),
      Resolution.sync,
      params.lifeTime,
      context => {
        const included = {} as any;

        Object.entries(params.include ?? {}).forEach(([key, def]) => {
          included[key] = context.use(def);
        });

        const contextWithExt = {
          ...included,
          use: (def: InstanceDefinition<TInstance, TLifeTime, TMeta>) => {
            assertValidDependency(params.lifeTime, def);
            return context.use(def);
          },
          useAll: context.useAll,
          checkoutScope: context.checkoutScope,
          withScope: context.withScope,
          override: context.override,
          provide: context.provide,
        };

        const instance = defineFn(contextWithExt);

        return params.after ? params.after(instance, meta) : instance;
      },
      [], // not usable for this kind of definitions
      meta,
    );
  };
};
