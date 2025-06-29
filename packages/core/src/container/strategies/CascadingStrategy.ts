import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver, IServiceLocator } from '../IContainer.js';
import type { IInterceptor } from '../interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { HierarchicalMap } from '../../context/HierarchicalMap.js';

export class CascadingStrategy {
  constructor(
    protected instancesStore: InstancesStore,
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

        // TODO:
        /*
           - Currently we use InheritedDefinitionBuilder for decorating inherited definitions, but we need something,
              like pipeline for actual value. The chain needs to start by passing inheritedValue
           - after getting decorated value, we need to store it in the instancesStore in the current scope
         */

        return inheritedValue;
      } else {
        return (this.cascadingRoots.get(definition.id) ?? locator).resolveCascading(definition);
      }
    }

    return (this.cascadingRoots.get(definition.id) ?? locator).resolveCascading(definition);
  }
}
