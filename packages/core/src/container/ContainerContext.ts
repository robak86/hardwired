import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { Module } from '../resolvers/abstract/Module';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Instance } from '../resolvers/abstract/Instance';
import { ResolversLookup } from './ResolversLookup';
import { unwrapThunk } from '../utils/Thunk';
import { reducePatches } from '../module/utils/reducePatches';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  static withOverrides(overrides: ModulePatch<any>[]): ContainerContext {
    const reducedOverrides = reducePatches(overrides);
    return new ContainerContext({}, {}, new ResolversLookup(), reducedOverrides);
  }

  private requestScope: Record<string, any> = {};
  private requestScopeAsync: Record<string, PushPromise<any>> = {};
  private materializedObjects: Record<string, any> = {};

  protected constructor(
    private globalScope: Record<string, any> = {},
    private patchedModules: Record<string, Module<any>> = {},
    private resolvers: ResolversLookup = new ResolversLookup(),
    private modulesPatches = ImmutableMap.empty(),
  ) {}

  getInstanceResolver(module: Module<any>, path: string): Instance<any> {
    if (this.resolvers.hasByModule(module.moduleId, path)) {
      return this.resolvers.getByModule(module.moduleId, path);
    }

    const targetModule: Module<any> = this.getModule(module);
    const [moduleOrInstance, instance] = path.split('.');
    const boundResolver = targetModule.registry.get(moduleOrInstance);

    if (boundResolver.type === 'resolver') {
      const resolver = unwrapThunk(boundResolver.resolverThunk);

      if (!this.resolvers.has(resolver)) {
        this.resolvers.add(targetModule, path, resolver);
      }

      return resolver;
    }

    if (boundResolver.type === 'module') {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
      const resolver = unwrapThunk(boundResolver.resolverThunk);
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
    return this.runResolver(resolver, this);
  }

  runResolver(resolver: Instance<any>, context: ContainerContext) {
    const module = this.resolvers.getModuleForResolver(resolver.id);
    const materializedModule = this.materializeModule(module, context);
    const result = resolver.build('todo', context, materializedModule);


    // TODO: use some more reliable detection ?
    if (result instanceof Instance) {
      return result.build('todo', context, materializedModule);
    }

    return result;
  }

  eagerLoad(module: Module<any>) {
    module.registry.forEach((boundResolver, key) => {
      if (boundResolver.type === 'module') {
        const resolver = unwrapThunk(boundResolver.resolverThunk);
        this.eagerLoad(resolver);
      }

      if (boundResolver.type === 'resolver') {
        this.getInstanceResolver(module, key);
      }
    });
  }

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope[uuid] = instance;
  }

  setForRequestScope(uuid: string, instance: any) {
    this.requestScope[uuid] = instance;
  }

  hasInGlobalScope(uuid: string): boolean {
    return !!this.globalScope[uuid];
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
    invariant(!!this.globalScope[uuid], `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope[uuid];
  }

  // TODO: should we return ContainerContext with clean requestScope ? or we should
  //       or we need some other kind of scope. In theory each react component should create this kind of scope
  //       and it should be inherited by all children
  forNewRequest(): ContainerContext {
    return new ContainerContext(this.globalScope, this.patchedModules, this.resolvers, this.modulesPatches);
  }

  getModule(module: Module<any>): Module<any> {
    const { moduleId } = module;

    if (!this.patchedModules[moduleId.id]) {
      if (this.modulesPatches.hasKey(moduleId.id)) {
        const modulePatch = this.modulesPatches.get(moduleId.id);
        this.patchedModules[moduleId.id] = module.patch(modulePatch);
      } else {
        this.patchedModules[moduleId.id] = module;
      }
    }

    return this.patchedModules[moduleId.id];
  }

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    if (context.materializedObjects[module.moduleId.id]) {
      return context.materializedObjects[module.moduleId.id];
    }

    const materialized: any = {};

    module.registry.forEach((boundResolver, key) => {
      if (boundResolver.type === 'resolver') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const initializedResolver = this.getInstanceResolver(module, key);
            return this.runResolver(initializedResolver, context);
          },
        });
      }

      if (boundResolver.type === 'module') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const resolver = unwrapThunk(boundResolver.resolverThunk);
            return this.materializeModule(resolver, context);
          },
        });
      }
    });

    context.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }
}
