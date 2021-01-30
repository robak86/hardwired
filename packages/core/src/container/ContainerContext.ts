import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { Module } from '../resolvers/abstract/Module';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Instance } from '../resolvers/abstract/Instance';
import { ResolversLookup } from './ResolversLookup';
import { unwrapThunk } from '../utils/Thunk';
import { ClassType } from '../utils/ClassType';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  private requestScope: Record<string, any> = {};
  private requestScopeAsync: Record<string, PushPromise<any>> = {};

  protected constructor(
    public globalScope: Record<string, any> = {},
    public modulesResolvers: Record<string, Module<any>> = {},
    public dependencies: Record<string, Instance<any, any>[] | Record<string, Instance<any, any>>> = {},
    public resolvers: ResolversLookup = new ResolversLookup(),
    public overrides = ImmutableMap.empty(),
  ) {}

  getInstanceResolver(module: Module<any>, path: string): Instance<any, any> {
    if (this.resolvers.hasByModule(module.moduleId, path)) {
      return this.resolvers.getByModule(module.moduleId, path);
    }

    if (!this.hasModule(module.moduleId)) {
      this.addModule(module);
    }

    const targetModule: Module<any> = this.getModule(module.moduleId);
    const [moduleOrInstance, instance] = path.split('.');

    const { resolverThunk, dependencies } = targetModule.registry.get(moduleOrInstance);
    const resolver = unwrapThunk(resolverThunk);

    invariant(resolver, `Cannot return instance resolver for path ${path}. ${moduleOrInstance} does not exist.`);

    if (resolver.kind === 'instanceResolver') {
      if (!this.hasWiredDependencies(resolver.id)) {
        const depsInstances = dependencies.map(d => {
          if (typeof d === 'string') {
            return this.getInstanceResolver(targetModule, d);
          }
          throw new Error('implement me');
        });

        this.setDependencies(resolver.id, depsInstances);
      }

      if (!this.resolvers.has(resolver)) {
        this.resolvers.add(targetModule, path, resolver);
        resolver.onInit?.(this);
      }

      return resolver;
    }

    if (resolver.kind === 'moduleResolver') {
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

  runResolver(resolver: Instance<any, any>, context: ContainerContext) {
    if (resolver.usesMaterializedModule) {
      const module = this.resolvers.getModuleForResolver(resolver.id);
      const materializedModule = this.materializeModule(module, context);
      return resolver.build(context, materializedModule);
    }

    return resolver.build(context);
  }

  eagerLoad(module: Module<any>) {
    module.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);
      if (resolver.kind === 'moduleResolver') {
        this.eagerLoad(resolver);
      }

      if (resolver.kind === 'instanceResolver') {
        this.getInstanceResolver(module, key);
      }
    });
  }

  setDependencies(uuid: string, instances: Instance<any, any>[] | Record<string, Instance<any, any>>) {
    this.dependencies[uuid] = instances;
  }

  getDependencies(uuid: string): Instance<any, any>[] {
    const deps = this.dependencies[uuid];
    invariant(Array.isArray(deps), `Cannot get dependencies. Instance wasn't initialized.`);
    return deps;
  }

  protected hasWiredDependencies(uuid: string): boolean {
    return !!this.dependencies[uuid];
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
    return new ContainerContext(
      this.globalScope,
      this.modulesResolvers,
      this.dependencies,
      this.resolvers,
      this.overrides,
    );
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

  // TODO: allow using resolvers factory, .e.g singleton, selector, store
  // TODO: it may be very tricky since container leverages lazy loading if possible
  __getByType_experimental<TValue, TResolverClass extends Instance<TValue, any>>(
    type: ClassType<TResolverClass, any>,
  ): TValue[] {
    return this.resolvers.filterByType(type).map(resolver => {
      return this.runResolver(resolver, this);
    });
  }

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    const materialized: any = {};

    module.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);
      if (resolver.kind === 'instanceResolver') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const initializedResolver = this.getInstanceResolver(module, key);
            return this.runResolver(initializedResolver, context);
          },
        });
      }

      if (resolver.kind === 'moduleResolver') {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => this.materializeModule(resolver, context),
        });
      }
    });

    return materialized;
  }
}
