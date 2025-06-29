import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver, IServiceLocator } from '../IContainer.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { HierarchicalMap } from '../../context/HierarchicalMap.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';

export class CascadingStrategy {
  constructor(
    protected instancesStore: InstancesStore,
    protected definitionsRegistry: BindingsRegistry,
    private inheritedTokens: Set<symbol>,
    private cascadingRoots: HierarchicalMap<ICascadingDefinitionResolver>,
  ) {}

  // TODO: inline strategies into container method.
  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    parent: (IServiceLocator & ICascadingDefinitionResolver) | null,
    locator: IServiceLocator & ICascadingDefinitionResolver,
  ): MaybeAsync<TValue> {
    if (this.inheritedTokens.has(definition.id)) {
      return locator.resolve(definition);
    }

    return (this.cascadingRoots.get(definition.id) ?? locator).resolveCascading(definition);
  }
}
