import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { ContainerEvents } from './ContainerEvents';
import { Module } from '../resolvers/abstract/Module';
import { ImmutableSet } from '../collections/ImmutableSet';
import { Instance } from '../resolvers/abstract/Instance';
import { ResolversLookup } from './ResolversLookup';
import { unwrapThunk } from '../utils/Thunk';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  public requestScope: Record<string, any> = {};
  public requestScopeAsync: Record<string, PushPromise<any>> = {};
  public containerEvents = new ContainerEvents();
  public resolvers: ResolversLookup = new ResolversLookup();

  protected constructor(
    public globalScope: Record<string, any> = {},
    public modulesResolvers: Record<string, Module<any>> = {},
    public dependencies: Record<string, Instance<any, any>[] | Record<string, Instance<any, any>>> = {},
    public injections = ImmutableSet.empty(),
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
        this.resolvers.add(targetModule.moduleId, path, resolver);
        resolver.onInit?.(this);
      }

      return resolver;
    }

    if (resolver.kind === 'moduleResolver') {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
      const instanceResolver = this.getInstanceResolver(resolver, instance);
      if (!this.resolvers.has(instanceResolver)) {
        this.resolvers.add(targetModule.moduleId, path, instanceResolver);
      }
      return instanceResolver;
    }

    throw new Error('should not happen');
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

  getStructuredDependencies(uuid: string): Record<string, Instance<any, any>> {
    const deps = this.dependencies[uuid];
    invariant(deps && !Array.isArray(deps), `Cannot get structured dependencies`);
    return deps;
  }

  hasWiredDependencies(uuid: string): boolean {
    return !!this.dependencies[uuid];
  }

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope[uuid] = instance;
  }

  setForRequestScope(uuid: string, instance: any) {
    this.requestScope[uuid] = instance;
  }

  inject(module: Module<any>) {
    this.injections = this.injections.extend(module.moduleId.id, module);
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

  forNewRequest(): ContainerContext {
    return new ContainerContext(this.globalScope, this.modulesResolvers, this.dependencies, this.injections);
  }

  protected addModule(module: Module<any>) {
    this.modulesResolvers[module.moduleId.id] = module;
  }

  hasModule(moduleId: ModuleId): boolean {
    return !!this.modulesResolvers[moduleId.id];
  }

  getModule(moduleId: ModuleId): Module<any> {
    const targetModule: Module<any> = this.injections.hasKey(moduleId.id)
      ? this.injections.get(moduleId.id)
      : this.modulesResolvers[moduleId.id];

    invariant(targetModule, `Cannot get module with moduleId: ${moduleId}`);
    return targetModule;
  }
}
