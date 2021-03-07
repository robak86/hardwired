import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { ContainerScopeOptions } from './Container';
import { ContextRecord } from './ContainerContextStorage';
import { ContextService } from './ContextService';
import { ContextLookup } from './ContextLookup';
import { ContextMutations } from './ContextMutations';

export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext(ContextRecord.create([]));
  }

  static withOverrides(overrides: ModulePatch<any>[]): ContainerContext {
    return new ContainerContext(ContextRecord.create(overrides));
  }

  constructor(
    protected record: ContextRecord, // private globalScope: SingletonScope = new SingletonScope(), // private loadedModules: Record<string, Module<any>> = {}, // private resolvers: ResolversLookup = new ResolversLookup(), // private hierarchicalScope: Record<string, any> = {},
  ) {}

  // TODO: move to ResolversLookup - getModule may make it impossible :/
  getInstanceResolver(module: Module<any>, path: string): Module.InstanceDefinition {
    return ContextService.getInstanceResolver(module, path, this.record);
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
    context = this.forNewRequest(),
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = ContextService.getInstanceResolver(moduleInstance, name, context.record);
    return ContextService.runInstanceDefinition(resolver, context.record);
  }

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContext) {
    return ContextService.runInstanceDefinition(instanceDefinition, context.record);
  }

  runWithPredicate(predicate: (resolver: Module.InstanceDefinition) => boolean, context: ContainerContext): unknown[] {
    return ContextService.runWithPredicate(predicate, context.record);
  }

  filterLoadedDefinitions(predicate: (resolver: Module.InstanceDefinition) => boolean): Module.InstanceDefinition[] {
    return ContextLookup.filterLoadedDefinitions(predicate, this.record);
  }

  setForGlobalScope(uuid: string, instance: any) {
    return ContextMutations.setForGlobalScope(uuid, instance, this.record);
  }

  setForRequestScope(uuid: string, instance: any) {
    return ContextMutations.setForRequestScope(uuid, instance, this.record);
  }

  hasInGlobalScope(uuid: string): boolean {
    return ContextLookup.hasInGlobalScope(uuid, this.record);
  }

  hasInRequestScope(uuid: string): boolean {
    return ContextLookup.hasInRequestScope(uuid, this.record);
  }

  // hasInAsyncRequestScope(uuid: string): boolean {
  //   return !!this.requestScopeAsync[uuid];
  // }

  // usingAsyncScope(uuid: string, cacheValueFactory: () => any): Promise<any> {
  //   this.requestScopeAsync[uuid] = new PushPromise();
  //   this.requestScopeAsync[uuid].push(cacheValueFactory());
  //   return this.requestScopeAsync[uuid].get();
  // }
  //
  // getFromAsyncRequestScope(uuid: string): Promise<any> {
  //   invariant(!!this.requestScopeAsync[uuid], `Dependency with given uuid doesn't exists in request scope`);
  //   return this.requestScopeAsync[uuid].get();
  // }

  getFromRequestScope(uuid: string) {
    return ContextLookup.getFromRequestScope(uuid, this.record);
  }

  getFromGlobalScope(uuid: string) {
    return ContextLookup.getFromGlobalScope(uuid, this.record);
  }

  // TODO: should we return ContainerContext with clean requestScope ? or we should
  //       or we need some other kind of scope. In theory each react component should create this kind of scope
  //       and it should be inherited by all children
  forNewRequest(): ContainerContext {
    return new ContainerContext(ContextRecord.checkoutRequestScope(this.record));
  }

  childScope(options: ContainerScopeOptions = {}): ContainerContext {
    return new ContainerContext(ContextRecord.childScope(options, this.record));
  }

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    return ContextService.materializeModule(module, context.record);
  }

  hasInHierarchicalScope(id: string) {
    return ContextLookup.hasInHierarchicalScope(id, this.record);
  }

  getFromHierarchicalScope(id: string) {
    return ContextLookup.getFromHierarchicalScope(id, this.record);
  }

  setForHierarchicalScope(id: string, instanceOrStrategy: any) {
    ContextMutations.setForHierarchicalScope(id, instanceOrStrategy, this.record);
  }
}
