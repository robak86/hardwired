import invariant from 'tiny-invariant';
import { InstanceDefinition } from '../new/InstanceDefinition';

export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(scopeOverrides: InstanceDefinition<any>[], globalOverrides: InstanceDefinition<any>[]): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, InstanceDefinition<any>>,
    private globalOverrideResolversById: Record<string, InstanceDefinition<any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: InstanceDefinition<any>[]) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideResolversById },
      this.globalOverrideResolversById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition(instanceDefinition: InstanceDefinition<any>): InstanceDefinition<any> {
    const id = instanceDefinition.id;

    if (this.globalOverrideResolversById[id]) {
      return this.globalOverrideResolversById[id];
    }

    if (this.scopeOverrideResolversById[id]) {
      return this.scopeOverrideResolversById[id];
    }

    return instanceDefinition;
  }

  hasGlobalOverrideResolver(resolverId: string): boolean {
    return !!this.globalOverrideResolversById[resolverId];
  }

  private hasScopeOverrideResolver(resolverId: string): boolean {
    return !!this.scopeOverrideResolversById[resolverId];
  }



  private addScopeOverrideResolver(resolver: InstanceDefinition<any>) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: InstanceDefinition<any>) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: InstanceDefinition<any>[]) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: InstanceDefinition<any>[]) {
    patches.forEach(patchedResolver => {
      this.addScopeOverrideResolver(patchedResolver);
    });
  }
}
