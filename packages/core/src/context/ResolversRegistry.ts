import { isInstanceDefinition, isImportDefinition, Module } from '../module/Module';
import invariant from 'tiny-invariant';
import { ModuleId } from '../module/ModuleId';
import { buildResolverId } from '../module/ModuleBuilder';
import { ModulePatch } from '../module/ModulePatch';

export class ResolversRegistry {
  static empty(): ResolversRegistry {
    return new ResolversRegistry({}, {});
  }

  static create(scopeOverrides: ModulePatch<any>[], globalOverrides: ModulePatch<any>[]): ResolversRegistry {
    const registry = ResolversRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, Module.InstanceDefinition>,
    private globalOverrideResolversById: Record<string, Module.InstanceDefinition>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: ModulePatch<any>[]) {
    const newRegistry = new ResolversRegistry({ ...this.scopeOverrideResolversById }, this.globalOverrideResolversById);
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getModuleDefinition(module: Module<any>, name: string): Module.Definition {
    if (this.hasGlobalOverrideResolver(module.moduleId, name)) {
      return this.getGlobalOverrideResolverByModuleAndPath(module.moduleId, name);
    }

    if (this.hasScopeOverrideResolver(module.moduleId, name)) {
      return this.getScopeOverrideResolver(module.moduleId, name);
    }

    return module.registry.get(name);
  }

  getModuleInstanceResolver(module: Module<any>, path: string): Module.InstanceDefinition {
    const resolver = this.getModuleDefinition(module, path);
    invariant(isInstanceDefinition(resolver), `Given path ${path} should return instance resolver`);
    return resolver;
  }

  private hasGlobalOverrideResolver(moduleId: ModuleId, path: string): boolean {
    return !!this.globalOverrideResolversById[buildResolverId({ moduleId }, path)];
  }

  private hasScopeOverrideResolver(moduleId: ModuleId, path: string): boolean {
    return !!this.scopeOverrideResolversById[buildResolverId({ moduleId }, path)];
  }

  private getScopeOverrideResolver(moduleId: ModuleId, path: string) {
    const resolver = this.scopeOverrideResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  private getGlobalOverrideResolverByModuleAndPath(moduleId: ModuleId, path: string) {
    const resolver = this.globalOverrideResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get invariant resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  private addScopeOverrideResolver(resolver: Module.InstanceDefinition) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: Module.InstanceDefinition) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addGlobalOverrideResolver(patchedResolver);
      });
    });
  }

  private addScopeOverrides(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addScopeOverrideResolver(patchedResolver);
      });
    });
  }
}
