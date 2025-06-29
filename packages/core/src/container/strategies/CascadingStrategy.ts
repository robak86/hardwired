import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver, IServiceLocator } from '../IContainer.js';
import type { IInterceptor } from '../interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { HierarchicalMap } from '../../context/HierarchicalMap.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { Definition } from '../../definitions/impl/Definition.js';

export class CascadingStrategy {
  constructor(
    protected instancesStore: InstancesStore,
    protected definitionsRegistry: BindingsRegistry,
    private inheritedTokens: Set<symbol>,
    private cascadingRoots: HierarchicalMap<ICascadingDefinitionResolver>,
  ) {}

  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    parent: (IServiceLocator & ICascadingDefinitionResolver) | null,
    locator: IServiceLocator & ICascadingDefinitionResolver,
    interceptor: IInterceptor,
  ): MaybeAsync<TValue> {
    if (this.instancesStore.hasScopedInstance(definition.id)) {
      return this.instancesStore.getScopedInstance(definition.id) as MaybeAsync<TValue>;
    }

    if (this.inheritedTokens.has(definition.id)) {
      if (parent) {
        const inheritedValue = parent.resolve(definition);

        this.definitionsRegistry.setDefinition(
          definition.id,
          new Definition(definition.id, LifeTime.scoped, () => {
            return inheritedValue;
          }),
        );

        return locator.resolve(definition);
      } else {
        return (this.cascadingRoots.get(definition.id) ?? locator).resolveCascading(definition);
      }
    }

    return (this.cascadingRoots.get(definition.id) ?? locator).resolveCascading(definition);
  }
}
