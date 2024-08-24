import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { IContainerScopes, InstanceCreationAware, IServiceLocator } from '../container/IContainer.js';
import { InstanceDefinition, InstancesRecord } from '../definitions/abstract/sync/InstanceDefinition.js';
import { assertValidDependency } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

export type DefineFn<TInstance, TLifeTime extends LifeTime, TProvidedBindings extends Record<string, any>> = (
  cnt: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & TProvidedBindings,
) => TInstance;

export function buildContext<
  TLifeTime extends LifeTime,
  TProvidedBindings extends Record<string, InstanceDefinition<any, any, any>>,
>(
  lifeTime: LifeTime,
  context: IServiceLocator<TLifeTime>,
  include?: TProvidedBindings,
): IServiceLocator<TLifeTime> & InstancesRecord<TProvidedBindings> {
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
    all: context.all,
    checkoutScope: context.checkoutScope,
    withScope: context.withScope,
    override: context.override,
    provide: context.provide,
  };
}
