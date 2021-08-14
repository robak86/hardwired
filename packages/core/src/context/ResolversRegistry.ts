import { isInstanceDefinition, isModuleDefinition, Module } from '../module/Module';
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

    registry.loadPatches(scopeOverrides);
    registry.loadInvariants(globalOverrides);

    return registry;
  }

  constructor(
    private patchedResolversById: Record<string, Module.InstanceDefinition>,
    private resolversById: Record<string, Module.InstanceDefinition>,
    private globalOverrideResolversById: Record<string, Module.InstanceDefinition>,
    private modulesByResolverId: Record<string, Module<any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: ModulePatch<any>[]) {
    const newRegistry = new ResolversRegistry(
      { ...this.patchedResolversById },
      this.resolversById,
      this.globalOverrideResolversById,
      this.modulesByResolverId,
    );

    newRegistry.loadPatches(scopeResolversOverrides)

    return newRegistry;
  }

  // TODO: rename -> append? set? replace? - be precise
  loadInvariants(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addGlobalOverrideResolver(Module.fromPatchedModule(modulePatch), patchedResolver);
      });
    });
  }

  loadPatches(patches: ModulePatch<any>[]) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        this.addPatchedResolver(Module.fromPatchedModule(modulePatch), patchedResolver);
      });
    });
  }

  addResolver(module: Module<any>, path: string, resolver: Module.InstanceDefinition) {
    invariant(
      !this.resolversById[resolver.id],
      `Cannot add resolver. Resolver with id=${resolver.id} for path=${path} already exists.`,
    );
    this.resolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }

  addPatchedResolver(module: Module<any>, resolver: Module.InstanceDefinition) {
    this.patchedResolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }

  addGlobalOverrideResolver(module: Module<any>, resolver: Module.InstanceDefinition) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
  }

  hasResolver(resolver: Module.InstanceDefinition): boolean {
    return !!this.resolversById[resolver.id];
  }

  hasResolverByModuleAndPath(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversById[buildResolverId({ moduleId }, path)];
  }

  hasInvariantResolver(moduleId: ModuleId, path: string): boolean {
    return !!this.globalOverrideResolversById[buildResolverId({ moduleId }, path)];
  }

  hasPatchedResolver(moduleId: ModuleId, path: string): boolean {
    return !!this.patchedResolversById[buildResolverId({ moduleId }, path)];
  }

  getPatchedResolver(moduleId: ModuleId, path: string) {
    const resolver = this.patchedResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  getResolverByModuleAndPath(moduleId: ModuleId, path: string) {
    const resolver = this.resolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  getInvariantResolverByModuleAndPath(moduleId: ModuleId, path: string) {
    const resolver = this.globalOverrideResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get invariant resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  }

  getModuleForResolverByResolverId(resolverId: string): Module<any> {
    const module = this.modulesByResolverId[resolverId];
    invariant(module, `Cannot find module for resolverId=${resolverId}`);
    return module;
  }

  getModuleDefinition(module: Module<any>, path: string): Module.Definition {
    if (this.hasInvariantResolver(module.moduleId, path)) {
      return this.getInvariantResolverByModuleAndPath(module.moduleId, path);
    }

    if (this.hasPatchedResolver(module.moduleId, path)) {
      return this.getPatchedResolver(module.moduleId, path);
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

    if (isModuleDefinition(definition)) {
      return definition;
    }

    invariant(false, `Returned instance should be Module or Instance Resolver`);
  }

  getModuleInstanceResolver(module: Module<any>, path: string): Module.InstanceDefinition {
    const resolver = this.getModuleDefinition(module, path);
    invariant(isInstanceDefinition(resolver), `Given path ${path} should return instance resolver`);
    return resolver;
  }
}
