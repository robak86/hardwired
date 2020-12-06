import { ModuleId } from "./ModuleId";
import { AbstractDependencyResolver } from "../resolvers/abstract/AbstractDependencyResolver";
import { ClassType } from "../utils/ClassType";
import { InstancesProxy } from "../resolvers/abstract/InstancesProxy";

import { InstanceLegacy } from "../resolvers/abstract/InstanceLegacy";
import { ModuleBuilder, ModuleEntriesRecord } from "./ModuleBuilder";

// TODO Split into Builder and readonly ModuleRegistry ? resolvers shouldn't be able to mutate this state
// TODO Renaming. RegistryRectory -> ModuleRecord and ModuleRegistry -> ModuleRecordLookup
export class ModuleLookup<TRegistryRecord extends ModuleEntriesRecord> {
  private dependenciesByResolverId: Record<string, InstanceLegacy<any>> = {};
  private dependenciesByModuleId: Record<string, Record<string, InstanceLegacy<any>>> = {};
  private dependenciesByName: Record<string, InstanceLegacy<any>> = {};
  private childModuleRegistriesByModuleId: Record<string, ModuleLookup<any>> = {};
  private resolvers: AbstractDependencyResolver<any>[] = [];
  protected parent?: ModuleLookup<any>;

  // TODO: encapsulate
  public instancesProxy = new InstancesProxy();
  public dependencyResolvers: Record<string, AbstractDependencyResolver<any>> = {};
  public modules: Record<string, ModuleBuilder<any>> = {};

  constructor(public moduleId: ModuleId) {}

  get registry(): Record<string, InstanceLegacy<any>> {
    return this.dependenciesByName;
  }

  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)
  // TODO: split module lookup into two classes - ModuleLookup (passed in onInit for module resolver) and DefinitionLookup (passed in onInit for dependency resolver)

  freezeImplementations() {
    Object.keys(this.dependencyResolvers).forEach(key => {
      this.instancesProxy.replaceImplementation(key, this.dependencyResolvers[key]);
    });
  }

  forEachModuleResolver(iterFn: (resolver: ModuleBuilder<any>) => void) {
    Object.keys(this.modules).forEach(key => {
      iterFn(this.modules[key]);
    });
  }

  forEachDependencyResolver(iterFn: (resolver: AbstractDependencyResolver<any>) => void) {
    Object.keys(this.dependencyResolvers).forEach(key => {
      iterFn(this.dependencyResolvers[key]);
    });
  }

  appendDependencyFactory(name: string, resolver: AbstractDependencyResolver<any>, factory: InstanceLegacy<any>) {
    this.dependenciesByName[name] = factory;
    this.dependenciesByResolverId[resolver.id] = factory;
    this.resolvers.push(resolver);
  }

  appendChild(registry: ModuleLookup<any>) {
    this.childModuleRegistriesByModuleId[registry.moduleId.identity] = registry;
    registry.parent = this;
  }

  // protected findOwnDependencyResolver(moduleId: ModuleId, name: string): Instance<any> | undefined {
  //   return this.dependenciesByModuleId[moduleId.identity]?.[name];
  // }

  getDependencyResolver(name: string): InstanceLegacy<any> | undefined {
    return this.dependenciesByName[name];
  }

  flattenModules(): Record<string, ModuleLookup<any>> {
    let result = {
      [this.moduleId.identity]: this,
      ...this.childModuleRegistriesByModuleId,
    };
    this.forEachModule(childModuleRegistry => {
      result = { ...result, ...childModuleRegistry.flattenModules() };
    });

    return result;
  }

  forEachDependency(iterFn: (key: string, d: InstanceLegacy<any>) => void) {
    Object.keys(this.dependenciesByName).forEach(key => {
      iterFn(key, this.dependenciesByName[key]);
    });
  }

  forEachModule(iterFn: (m: ModuleLookup<any>) => void) {
    Object.values(this.childModuleRegistriesByModuleId).forEach(iterFn);
  }

  findDependencyFactory(moduleId: ModuleId, name: string): InstanceLegacy<any> | undefined {
    const modules = this.flattenModules();
    return modules[moduleId.identity]?.getDependencyResolver(name);
  }

  // findAncestorResolvers(resolverClass: ClassType<any, AbstractDependencyResolver<any>>): Instance<any>[] {
  //   const own = this.findOwnResolversByType(resolverClass);
  //   if (own.length) {
  //     return own;
  //   }
  //
  //   if (!this.parent) {
  //     return [];
  //   }
  //
  //   return this.parent.findAncestorResolvers(resolverClass);
  // }

  findAncestorResolvers(resolverClass: ClassType<any, AbstractDependencyResolver<any>>): InstanceLegacy<any>[] {
    const own = this.findOwnResolversByType(resolverClass);
    const fromParent = this.parent ? this.parent.findAncestorResolvers(resolverClass) : [];

    return [...fromParent, ...own];
  }

  protected findOwnResolversByType(type): InstanceLegacy<any>[] {
    return this.resolvers
      .filter(resolver => resolver instanceof type)
      .map(resolver => this.dependenciesByResolverId[resolver.id]);
  }

  findFactoriesByResolverClass(resolverClass): InstanceLegacy<any>[] {
    const modules = this.flattenModules();
    return Object.values(modules).flatMap(moduleRegistry => moduleRegistry.findOwnResolversByType(resolverClass));
  }
  //
  // freeze() {
  //   // TODO: It's probably faster than immutable, but are we sure that we won't extend this object?
  //   // TODO: without immutability memoization of methods like flatten may be difficult (without manual invalidation managing)?
  //   Object.freeze(this.dependenciesByResolverId);
  //   Object.freeze(this.dependenciesByName);
  //   Object.freeze(this.childModuleRegistriesByModuleId);
  // }
  //
  // isEqual(other: ModuleLookup<any>): boolean {
  //   return this.moduleId.identity === other.moduleId.identity;
  // }
}
