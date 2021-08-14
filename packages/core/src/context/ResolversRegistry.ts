import { isInstanceDefinition, isImportDefinition, Module } from '../module/Module';
import invariant from 'tiny-invariant';
import { ModuleId } from '../module/ModuleId';
import { buildResolverId } from '../module/ModuleBuilder';
import { ModulePatch } from '../module/ModulePatch';

export class ResolversRegistry {
  static empty(): ResolversRegistry {
    return new ResolversRegistry({}, {}, {}, {});
  }

  static create(scopeOverrides: ModulePatch<any>[], globalOverrides: ModulePatch<any>[]): ResolversRegistry {
    const registry = ResolversRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, Module.InstanceDefinition>,
    private resolversById: Record<string, Module.InstanceDefinition>,
    private globalOverrideResolversById: Record<string, Module.InstanceDefinition>,
    private modulesByResolverId: Record<string, Module<any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: ModulePatch<any>[]) {
    const newRegistry = new ResolversRegistry(
      { ...this.scopeOverrideResolversById },
      this.resolversById,
      this.globalOverrideResolversById,
      this.modulesByResolverId,
    );

    newRegistry.addScopeOverrides(scopeResolversOverrides);

    return newRegistry;
  }

  addGlobalOverrides(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addGlobalOverrideResolver(Module.fromPatchedModule(modulePatch), patchedResolver);
      });
    });
  }

  addScopeOverrides(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addScopeOverrideResolver(Module.fromPatchedModule(modulePatch), patchedResolver);
      });
    });
  }

  getModuleForResolverByResolverId(resolverId: string): Module<any> {
    const module = this.modulesByResolverId[resolverId];
    invariant(module, `Cannot find module for resolverId=${resolverId}`);
    return module;
  }

  getModuleDefinition(module: Module<any>, path: string): Module.Definition {
    if (this.hasGlobalOverrideResolver(module.moduleId, path)) {
      return this.getGlobalOverrideResolverByModuleAndPath(module.moduleId, path);
    }

    if (this.hasScopeOverrideResolver(module.moduleId, path)) {
      return this.getScopeOverrideResolver(module.moduleId, path);
    }

    if (this.hasResolverByModuleAndPath(module.moduleId, path)) {
      return this.getResolverByModuleAndPath(module.moduleId, path);
    }

    const definition = module.registry.get(path);

    if (isInstanceDefinition(definition)) {
      if (!this.hasResolver(definition)) {
        this.addResolver(module, path, definition);
      }

      return definition;
    }

    if (isImportDefinition(definition)) {
      return definition;
    }

    invariant(false, `Returned instance should be Module or Instance Resolver`);
  }

  getModuleInstanceResolver(module: Module<any>, path: string): Module.InstanceDefinition {
    const resolver = this.getModuleDefinition(module, path);
    invariant(isInstanceDefinition(resolver), `Given path ${path} should return instance resolver`);
    return resolver;
  }

  private addResolver(module: Module<any>, path: string, resolver: Module.InstanceDefinition) {
    invariant(
      !this.resolversById[resolver.id],
      `Cannot add resolver. Resolver with id=${resolver.id} for path=${path} already exists.`,
    );
    this.resolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }

  private hasResolver(resolver: Module.InstanceDefinition): boolean {
    return !!this.resolversById[resolver.id];
  }

  private hasResolverByModuleAndPath(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversById[buildResolverId({ moduleId }, path)];
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

  private getResolverByModuleAndPath(moduleId: ModuleId, path: string) {
    const resolver = this.resolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  private getGlobalOverrideResolverByModuleAndPath(moduleId: ModuleId, path: string) {
    const resolver = this.globalOverrideResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get invariant resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  private addScopeOverrideResolver(module: Module<any>, resolver: Module.InstanceDefinition) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }

  private addGlobalOverrideResolver(module: Module<any>, resolver: Module.InstanceDefinition) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }
}
