import { InstanceDefinition, InstancesRecord } from '../definitions/abstract/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { assertValidDependency } from '../definitions/abstract/InstanceDefinitionDependency.js';

import { IContainerScopes, InstanceCreationAware } from '../container/IContainer.js';
import { ContainerContext } from '../context/ContainerContext.js';

export type DefineFn<TInstance, TLifeTime extends LifeTime, TProvidedBindings extends Record<string, any>> = (
  cnt: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime> & TProvidedBindings,
) => TInstance;

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
