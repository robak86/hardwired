import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { isInstanceDefinition, isModuleDefinition, Module } from '../resolvers/abstract/Module';
import { ResolversLookup } from './ResolversLookup';
import { unwrapThunk } from '../utils/Thunk';
import { reducePatches } from '../module/utils/reducePatches';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { getPatchesDefinitionsIds } from '../module/utils/getPatchesDefinitionsIds';
import { SingletonScope } from './SingletonScope';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  static withOverrides(overrides: ModulePatch<any>[]): ContainerContext {
    const reducedOverrides = reducePatches(overrides);
    const ownKeys = getPatchesDefinitionsIds(reducedOverrides);
    return new ContainerContext(new SingletonScope(ownKeys), {}, new ResolversLookup(), reducedOverrides);
  }

  private requestScope: Record<string, any> = {};
  private requestScopeAsync: Record<string, PushPromise<any>> = {};
  private materializedObjects: Record<string, any> = {};

  protected constructor(
    private globalScope: SingletonScope = new SingletonScope(),
    private loadedModules: Record<string, Module<any>> = {},
    private resolvers: ResolversLookup = new ResolversLookup(),
    private modulesPatches: Record<string, ModulePatch<any>> = {},
    private hierarchicalScope: Record<string, any> = {},
  ) {}

  // TODO: move to ResolversLookup - getModule may make it impossible :/
  getInstanceResolver(module: Module<any>, path: string): Module.InstanceDefinition {
    if (this.resolvers.hasByModule(module.moduleId, path)) {
      return this.resolvers.getByModule(module.moduleId, path);
    }

    const targetModule: Module<any> = this.getModule(module);
    const [moduleOrInstance, instance] = path.split('.');
    const definition = targetModule.registry.get(moduleOrInstance);

    if (definition.type === 'resolver') {
      if (!this.resolvers.has(definition)) {
        this.resolvers.add(targetModule, path, definition);
      }

      return definition;
    }

    if (definition.type === 'module') {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
      const resolver = unwrapThunk(definition.resolverThunk);
      const instanceResolver = this.getInstanceResolver(resolver, instance);
      if (!this.resolvers.has(instanceResolver)) {
        this.resolvers.add(targetModule, path, instanceResolver);
      }
      return instanceResolver;
    }

    throw new Error('should not happen');
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = this.getInstanceResolver(moduleInstance, name);
    return this.runInstanceDefinition(resolver, this.forNewRequest());
  }

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContext) {
    const module = this.resolvers.getModuleForResolver(instanceDefinition.id);
    const materializedModule = this.materializeModule(module, context);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, context, materializedModule);
  }

  eagerLoad(module: Module<any>) {
    module.registry.forEach((definition, key) => {
      if (isModuleDefinition(definition)) {
        const resolver = unwrapThunk(definition.resolverThunk);
        this.eagerLoad(resolver);
      }

      if (isInstanceDefinition(definition)) {
        this.getInstanceResolver(module, key);
      }
    });
  }

  filterLoadedResolvers(predicate: (resolver: Module.InstanceDefinition) => boolean): Module.InstanceDefinition[] {
    return Object.keys(this.loadedModules).flatMap(moduleId => {
      const module = this.loadedModules[moduleId];
      const definitions = module.registry.values;

      return definitions.filter(definition => {
        return isInstanceDefinition(definition) && predicate(definition);
      }) as Module.InstanceDefinition[];
    });
  }

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope.set(uuid, instance);
  }

  setForRequestScope(uuid: string, instance: any) {
    this.requestScope[uuid] = instance;
  }

  hasInGlobalScope(uuid: string): boolean {
    return this.globalScope.has(uuid);
  }

  hasInRequestScope(uuid: string): boolean {
    return !!this.requestScope[uuid];
  }

  hasInAsyncRequestScope(uuid: string): boolean {
    return !!this.requestScopeAsync[uuid];
  }

  usingAsyncScope(uuid: string, cacheValueFactory: () => any): Promise<any> {
    this.requestScopeAsync[uuid] = new PushPromise();
    this.requestScopeAsync[uuid].push(cacheValueFactory());
    return this.requestScopeAsync[uuid].get();
  }

  getFromAsyncRequestScope(uuid: string): Promise<any> {
    invariant(!!this.requestScopeAsync[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScopeAsync[uuid].get();
  }

  getFromRequestScope(uuid: string) {
    invariant(!!this.requestScope[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScope[uuid];
  }

  getFromGlobalScope(uuid: string) {
    invariant(!!this.globalScope.has(uuid), `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope.get(uuid);
  }

  // TODO: should we return ContainerContext with clean requestScope ? or we should
  //       or we need some other kind of scope. In theory each react component should create this kind of scope
  //       and it should be inherited by all children
  forNewRequest(): ContainerContext {
    return new ContainerContext(
      this.globalScope,
      this.loadedModules,
      this.resolvers,
      this.modulesPatches,
      this.hierarchicalScope,
    );
  }

  childScope(patches: ModulePatch<any>[] = []): ContainerContext {
    const childScopePatches = reducePatches(patches, this.modulesPatches);
    const ownKeys = getPatchesDefinitionsIds(childScopePatches);

    return new ContainerContext(
      this.globalScope.checkoutChild(ownKeys),
      {},
      new ResolversLookup(),
      childScopePatches,
      {},
    );
  }

  getModule(module: Module<any>): Module<any> {
    const { moduleId } = module;

    if (!this.loadedModules[moduleId.id]) {
      this.loadedModules[moduleId.id] = this.modulesPatches[moduleId.id]
        ? module.patch(this.modulesPatches[moduleId.id])
        : module;
    }

    return this.loadedModules[moduleId.id];
  }

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    if (context.materializedObjects[module.moduleId.id]) {
      return context.materializedObjects[module.moduleId.id];
    }

    const materialized: any = {};

    module.registry.forEach((definition, key) => {
      if (isInstanceDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const initializedResolver = this.getInstanceResolver(module, key); //TODO: move into closure so above this is called only once for all get calls
            return this.runInstanceDefinition(initializedResolver, context);
          },
        });
      }

      if (isModuleDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const resolver = unwrapThunk(definition.resolverThunk);
            return this.materializeModule(resolver, context);
          },
        });
      }
    });

    context.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }

  hasInHierarchicalScope(id: string) {
    return !!this.hierarchicalScope[id];
  }

  getFromHierarchicalScope(id: string) {
    return this.hierarchicalScope[id];
  }

  setForHierarchicalScope(id: string, instanceOrStrategy: any) {
    this.hierarchicalScope[id] = instanceOrStrategy;
  }
}
