import {
  InstanceDefinition,
  InstancesArray,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { singleton } from '../definitions/definitions.js';
import { v4 } from 'uuid';
import { Resolution } from '../definitions/abstract/Resolution.js';

// TODO:
// we probably don't need Resolution enum
// we probably don't need AsyncDefinition
// - strategies are synchronous. and with the new approach we can just use async functions

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue, TExternals>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue, TExternals>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;

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
  lifeTime?: TLifeTime;
  include?: TBuildIns;
  after?: <TInstance>(instance: TInstance, meta: TMeta) => TInstance;
  pre?: <TInstance>(def: AnyInstanceDefinition<TInstance, any, any>) => TInstance;
  buildMeta?: (...args: TPreambleArgs) => TMeta;
};

export const buildDefine = <
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime extends LifeTime = LifeTime.singleton,
>(
  params: CustomBind<TProvidedBindings, TPreambleArgs, TMeta, TLifeTime>,
) => {
  return <TInstance>(
    ...args: [...TPreambleArgs, (cnt: InstanceCreationAware & InstancesRecord<TProvidedBindings>) => TInstance]
  ): InstanceDefinition<TInstance, TLifeTime, TMeta> => {
    const defineFn = args.at(-1) as (cnt: InstanceCreationAware & InstancesRecord<TProvidedBindings>) => TInstance;
    const preambleArgs = args.slice(0, -1) as TPreambleArgs;
    const meta = params.buildMeta?.(...preambleArgs) as TMeta;

    return new InstanceDefinition<TInstance, TLifeTime, TMeta>(
      v4(),
      Resolution.sync,
      params.lifeTime ?? (LifeTime.singleton as any),
      context => {
        const included = {} as any;

        Object.entries(params.include ?? {}).forEach(([key, def]) => {
          included[key] = context.buildWithStrategy(def);
        });

        const contextWithExt = {
          ...included,
          use: context.buildWithStrategy,
          getAll: () => {
            throw new Error('Implement me!');
          },
        };

        const instance = defineFn(contextWithExt);

        return params.after ? params.after(instance, meta) : instance;
      },
      [], // not usable for this kind of definitions
      meta,
    );
  };
};
