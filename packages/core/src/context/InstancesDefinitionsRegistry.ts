import invariant from 'tiny-invariant';
import { InstanceDefinition } from '../strategies/abstract/InstanceDefinition';
import { AnyInstanceDefinition } from "../strategies/abstract/AnyInstanceDefinition";

export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(scopeOverrides: AnyInstanceDefinition<any>[], globalOverrides: AnyInstanceDefinition<any>[]): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, AnyInstanceDefinition<any>>,
    private globalOverrideResolversById: Record<string, AnyInstanceDefinition<any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: AnyInstanceDefinition<any>[]) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideResolversById },
      this.globalOverrideResolversById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition(instanceDefinition: AnyInstanceDefinition<any, any, any>): AnyInstanceDefinition<any, any, any> {
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



  private addScopeOverrideResolver(resolver: AnyInstanceDefinition<any>) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: AnyInstanceDefinition<any>) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: AnyInstanceDefinition<any>[]) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: AnyInstanceDefinition<any>[]) {
    patches.forEach(patchedResolver => {
      this.addScopeOverrideResolver(patchedResolver);
    });
  }
}
