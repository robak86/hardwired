import { ModuleId } from './ModuleId';
import { DependencyFactory, RegistryRecord } from './RegistryRecord';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractDependencyResolver } from '../resolvers/AbstractDependencyResolver';
import { ClassType } from '../utils/ClassType';

// TODO Split into Builder and readonly ModuleRegistry ? resolvers shouldn't be able to mutate this state
// TODO Renaming. RegistryRectory -> ModuleRecord and ModuleRegistry -> ModuleRecordLookup
export class ModuleLookup<TRegistryRecord extends RegistryRecord> {
  private dependenciesByResolverId: Record<string, DependencyFactory<any>> = {};
  private dependenciesByModuleId: Record<string, Record<string, DependencyFactory<any>>> = {};
  private dependenciesByName: Record<string, DependencyFactory<any>> = {};
  private childModuleRegistriesByModuleId: Record<string, ModuleLookup<any>> = {};
  private resolvers: DependencyResolver<any>[] = [];
  protected parent?: ModuleLookup<any>;

  constructor(public moduleId: ModuleId) {}

  get registry(): Record<string, DependencyFactory<any>> {
    return this.dependenciesByName;
  }

  appendDependencyFactory(name: string, resolver: AbstractDependencyResolver<any>, factory: DependencyFactory<any>) {
    this.dependenciesByName[name] = factory;
    this.dependenciesByResolverId[resolver.id] = factory;
    this.resolvers.push(resolver);
  }

  appendChild(registry: ModuleLookup<any>) {
    this.childModuleRegistriesByModuleId[registry.moduleId.identity] = registry;
    registry.parent = this;
  }

  // protected findOwnDependencyResolver(moduleId: ModuleId, name: string): DependencyFactory<any> | undefined {
  //   return this.dependenciesByModuleId[moduleId.identity]?.[name];
  // }

  getDependencyResolver(name: string): DependencyFactory<any> | undefined {
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

  forEachDependency(iterFn: (key: string, d: DependencyFactory<any>) => void) {
    Object.keys(this.dependenciesByName).forEach(key => {
      iterFn(key, this.dependenciesByName[key]);
    });
  }

  forEachModule(iterFn: (m: ModuleLookup<any>) => void) {
    Object.values(this.childModuleRegistriesByModuleId).forEach(iterFn);
  }

  findDependencyFactory(moduleId: ModuleId, name: string): DependencyFactory<any> | undefined {
    const modules = this.flattenModules();
    return modules[moduleId.identity]?.getDependencyResolver(name);
  }

  // findAncestorResolvers(resolverClass: ClassType<any, AbstractDependencyResolver<any>>): DependencyFactory<any>[] {
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

  findAncestorResolvers(resolverClass: ClassType<any, AbstractDependencyResolver<any>>): DependencyFactory<any>[] {
    const own = this.findOwnResolversByType(resolverClass);
    const fromParent = this.parent ? this.parent.findAncestorResolvers(resolverClass) : [];

    return [...fromParent, ...own];
  }

  protected findOwnResolversByType(type): DependencyFactory<any>[] {
    return this.resolvers
      .filter(resolver => resolver instanceof type)
      .map(resolver => this.dependenciesByResolverId[resolver.id]);
  }

  findFactoriesByResolverClass(resolverClass): DependencyFactory<any>[] {
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
