import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerCache } from '../container/container-cache';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from './DependencyResolver';
import { ClassType } from '../../../di-core/src/module/ModuleUtils';
import { DependencyFactory } from '../draft';

// export class ClassSingletonResolver<
//   TRegistryRecord extends RegistryRecord,
//   TReturn = any
// > extends AbstractDependencyResolver<TRegistryRecord, TReturn> {
//   constructor(privateprivate klass, private selectDependencies = container => [] as any[]) {
//     super();
//   }
//
//   build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
//     if (cache.hasInGlobalScope(this.id)) {
//       return cache.getFromGlobalScope(this.id);
//     } else {
//       const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
//       const instance = new this.klass(...constructorArgs);
//       cache.setForGlobalScope(this.id, instance);
//       return instance;
//     }
//   };
// }

export class ClassSingletonResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor() {
    super();
  }

  build(registry: ModuleRegistry<any>): DependencyFactory<TReturn> {
    // const context = {};
    //
    // const byKey = this.registry.entries.reduce((grouped, entry) => {
    //   const resolver = entry(context);
    //
    //   context[resolver.key] = (cache: ContainerCache) => {
    //     resolver.build(registry, cache, ctx);
    //   };
    //
    //   return grouped;
    // }, {});

    // return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
    throw new Error('Implement me');
  }

  forEach(iterFn: (resolver: DependencyResolver<any>) => any) {
    // this.registry.forEachDefinition(iterFn);
  }
}

export type MaterializedDependencies<TDeps extends any[]> = {
  [K in keyof TDeps]: (container: ContainerCache) => TDeps[K];
};

type ClassSingletonBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassSingletonResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: (container: ContainerCache) => TDeps[K] },
  ): ClassSingletonResolver<TResult>;
};

export const singleton: ClassSingletonBuilder = (...args: any[]) => {
  return null as any;
};
