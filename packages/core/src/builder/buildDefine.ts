import {
  InstanceDefinition,
  InstancesArray,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import {
  assertValidDependency,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { v4 } from 'uuid';

import { IContainerScopes } from '../container/IContainer.js';
import { ContainerContext } from '../context/ContainerContext.js';

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

  useAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
}

export type CustomBind<
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

export type DefineFn<
  TLifeTime extends LifeTime,
  TMeta,
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
> = <TInstance>(
  ...args: [
    ...TPreambleArgs,
    (
      cnt: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & InstancesRecord<TProvidedBindings>,
    ) => TInstance,
  ]
) => InstanceDefinition<TInstance, TLifeTime, TMeta>;

export type DefineClbk<
  TLifeTime extends LifeTime,
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TInstance,
> = (
  cnt: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & InstancesRecord<TProvidedBindings>,
) => TInstance;

export const buildDefine = <
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TPreambleArgs extends any[],
  TMeta,
  TLifeTime extends LifeTime,
>(
  params: CustomBind<TProvidedBindings, TPreambleArgs, TMeta, TLifeTime>,
): DefineFn<TLifeTime, TMeta, TProvidedBindings, TPreambleArgs> => {
  return <TInstance>(
    ...args: [...TPreambleArgs, DefineClbk<TLifeTime, TProvidedBindings, TInstance>]
  ): InstanceDefinition<TInstance, TLifeTime, TMeta> => {
    const defineFn = args.at(-1) as (
      cnt: InstanceCreationAware<TLifeTime> & InstancesRecord<TProvidedBindings>,
    ) => TInstance;
    const preambleArgs = args.slice(0, -1) as TPreambleArgs;
    const meta = params.buildMeta?.(...preambleArgs) as TMeta;

    return new InstanceDefinition<TInstance, TLifeTime, TMeta>(
      v4(),
      params.lifeTime,
      context => {
        const serviceLocator = buildContext(params.lifeTime, context, params.include);
        const instance = defineFn(serviceLocator);
        return params.after ? params.after(instance, meta) : instance;
      },
      meta,
    );
  };
};

export const withBindings = <
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
  TInstance,
  TLifeTime extends LifeTime,
>(
  lifeTime: TLifeTime,
  bindings: TProvidedBindings,
  defineFn: DefineClbk<TLifeTime, TProvidedBindings, TInstance>,
) => {
  return (context: ContainerContext): TInstance => {
    const serviceLocator = buildContext(lifeTime, context, bindings);
    return defineFn(serviceLocator);
  };
};

export function buildContext<
  TLifeTime extends LifeTime,
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
>(
  lifeTime: LifeTime,
  context: ContainerContext,
  include?: TProvidedBindings,
): InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & InstancesRecord<TProvidedBindings> {
  const included = {} as any;

  Object.entries(include ?? {}).forEach(([key, def]) => {
    included[key] = context.use(def);
  });

  return {
    ...included,
    use: def => {
      assertValidDependency(lifeTime, def);
      return context.use(def);
    },
    useAll: context.useAll,
    checkoutScope: context.checkoutScope,
    withScope: context.withScope,
    override: context.override,
    provide: context.provide,
  };
}
