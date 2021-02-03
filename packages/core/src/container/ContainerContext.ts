import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { Module } from '../resolvers/abstract/Module';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Instance } from '../resolvers/abstract/Instance';
import { ResolversLookup } from './ResolversLookup';
import { unwrapThunk } from '../utils/Thunk';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  private requestScope: Record<string, any> = {};
  private requestScopeAsync: Record<string, PushPromise<any>> = {};
  private materializedObjects: Record<string, any> = {};

  protected constructor(
    public globalScope: Record<string, any> = {},
    public modulesResolvers: Record<string, Module<any>> = {},
    public resolvers: ResolversLookup = new ResolversLookup(),
    public overrides = ImmutableMap.empty(),
  ) {}

  getInstanceResolver(module: Module<any>, path: string): Instance<any> {
    if (this.resolvers.hasByModule(module.moduleId, path)) {
      return this.resolvers.getByModule(module.moduleId, path);
    }

    if (!this.hasModule(module.moduleId)) {
      this.addModule(module);
    }

    const targetModule: Module<any> = this.getModule(module.moduleId);
    const [moduleOrInstance, instance] = path.split('.');

    const { resolverThunk } = targetModule.registry.get(moduleOrInstance);
    const resolver = unwrapThunk(resolverThunk);

    invariant(resolver, `Cannot return instance resolver for path ${path}. ${moduleOrInstance} does not exist.`);

    if (resolver.__kind === 'instanceResolver') {
      if (!this.resolvers.has(resolver)) {
        this.resolvers.add(targetModule, path, resolver);
      }

      return resolver;
    }

    if (resolver.__kind === 'moduleResolver') {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
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
    const result = resolver.build(context, materializedModule);

    if (result.__kind === 'instanceResolver') {
      return result.build(context, materializedModule);
    }

    return result;
  }

  eagerLoad(module: Module<any>) {
    module.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);
      if (resolver.__kind === 'moduleResolver') {
        this.eagerLoad(resolver);
      }

      if (resolver.__kind === 'instanceResolver') {
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

  override(module: Module<any>) {
    this.overrides = this.overrides.extend(module.moduleId.id, module);
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
    return new ContainerContext(this.globalScope, this.modulesResolvers, this.resolvers, this.overrides);
  }

  protected addModule(module: Module<any>) {
    this.modulesResolvers[module.moduleId.id] = module;
  }

  hasModule(moduleId: ModuleId): boolean {
    return !!this.modulesResolvers[moduleId.id];
  }

  getModule(moduleId: ModuleId): Module<any> {
    const targetModule: Module<any> = this.overrides.hasKey(moduleId.id)
      ? this.overrides.get(moduleId.id)
      : this.modulesResolvers[moduleId.id];

    invariant(targetModule, `Cannot get module with moduleId: ${moduleId}`);
    return targetModule;
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
      const resolver = unwrapThunk(boundResolver.resolverThunk);
      if (resolver.__kind === 'instanceResolver') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const initializedResolver = this.getInstanceResolver(module, key);
            return this.runResolver(initializedResolver, context);
          },
        });
      }

      if (resolver.__kind === 'moduleResolver') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => this.materializeModule(resolver, context),
        });
      }
    });

    context.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }
}
