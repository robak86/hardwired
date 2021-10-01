import invariant from 'tiny-invariant';
import { InstanceEntry } from '../new/InstanceEntry';

export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(scopeOverrides: InstanceEntry<any>[], globalOverrides: InstanceEntry<any>[]): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, InstanceEntry<any>>,
    private globalOverrideResolversById: Record<string, InstanceEntry<any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: InstanceEntry<any>[]) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideResolversById },
      this.globalOverrideResolversById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceEntry(instanceDefinition: InstanceEntry<any>): InstanceEntry<any> {
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



  private addScopeOverrideResolver(resolver: InstanceEntry<any>) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: InstanceEntry<any>) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: InstanceEntry<any>[]) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: InstanceEntry<any>[]) {
    patches.forEach(patchedResolver => {
      this.addScopeOverrideResolver(patchedResolver);
    });
  }
}
