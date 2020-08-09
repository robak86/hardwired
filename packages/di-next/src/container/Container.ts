import { ContainerCache } from './container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';

import { ModuleBuilder } from '../builders/ModuleBuilder';
import { ContainerService } from './ContainerService';
import { ModuleResolver } from '../resolvers/ModuleResolver';
import { RegistryRecord } from '../module/RegistryRecord';

interface GetMany<D> {
  <K extends keyof D>(key: K): [D[K]];

  <K extends keyof D, K2 extends keyof D>(key: K, key2: K2): [D[K], D[K2]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key: K, key2: K2, key3: K3): [D[K], D[K2], D[K3]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(
    key: K,
    key2: K2,
    key3: K3,
    key4: K4,
  ): [D[K], D[K2], D[K3], D[K4]];
}

export type DeepGetReturnErrorMessage = `Given module cannot be used with deepGet because module's context is missing in the container`;
//
// export type DeepGetReturn<
//   K extends keyof MaterializedDefinitions<TModuleRegistry>,
//   TModuleRegistry extends RegistryRecord,
//   TContainerRegistry extends RegistryRecord
// > = ModuleRegistryContext<TContainerRegistry> extends ModuleRegistryContext<TModuleRegistry>
//   ? MaterializedModuleEntries<TModuleRegistry>[K]
//   : DeepGetReturnErrorMessage;


// TODO: accept custom ModuleResolver (may be necessary, e.g. for react containers ?)
// or for sake of compatibility, EagerModuleResolver, ProxyModuleResolver, etc
export class Container<TRegistryRecord extends RegistryRecord = {}, C = {}> {
  private rootResolver: ModuleResolver<any>;
  private registry: ModuleRegistry;

  constructor(
    moduleBuilder: ModuleBuilder<TRegistryRecord>,
    private cache: ContainerCache = new ContainerCache(),
    private context?: C,
  ) {
    this.rootResolver = new ModuleResolver<any>(moduleBuilder);
    this.registry = this.rootResolver.build()[0];
  }

  get = <K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>>(
    key: K,
  ): RegistryRecord.Materialized<TRegistryRecord>[K] => {
    return ContainerService.getChild(this.registry, this.cache.forNewRequest(), this.context, key as any);
  };

  getMany: GetMany<RegistryRecord.DependencyResolversKeys<TRegistryRecord>> = (...args: any[]) => {
    const cache = this.cache.forNewRequest();

    return args.map(dep => {
      return ContainerService.getChild(this.registry, cache, this.context, dep);
    }) as any;
  };

  // asObject(): MaterializedModuleEntries<R> {
  asObject(): TRegistryRecord {
    return ContainerService.proxyGetter(this.registry, this.cache.forNewRequest(), this.context);
  }

  // checkout(inherit: boolean): Container<R> {
  //   if (inherit) {
  //     return new Container(this.registry, this.cache, this.context); // TODO: we should return this.cache.clone() otherwise this checkout without inheritance does not make any sense
  //   } else {
  //     return new Container(this.registry, new ContainerCache(), this.context);
  //   }
  // }

  // TODO: this may breaks the encapsulation!!! is this really required ? it's not type safe!
  deepGet<TNextR extends RegistryRecord, K extends RegistryRecord.DependencyResolversKeys<TNextR>>(
    module: ModuleBuilder<TNextR>,
    key: K,
  ): any {
    throw new Error('Implement me');
    // // ): DeepGetReturn<K, TNextR, R> {
    // //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered
    // let childModule: ModuleRegistry<any> | undefined = this.registry.isEqual(module.registry)
    //   ? this.registry
    //   : unwrapThunk(this.findModule(module.registry));
    //
    // // TODO: we probably be explicit (add method appendModule) and throw an error for an unknown module here
    // if (!childModule) {
    //   console.warn('deepGet called with module which is not imported by any descendant module');
    //   childModule = module.registry;
    // }
    //
    // ContainerService.init(childModule, this.cache, this.context);
    // return ContainerService.getChild(childModule, this.cache, this.context, key as string);
  }

  private findModule(moduleIdentity: ModuleRegistry): ModuleRegistry | undefined {
    return this.registry.findModule(moduleIdentity);
  }

  // TODO: add flag - for preventing getting instances from uninitialized container
  public init() {
    ContainerService.callDefinitionsListeners(this.registry);
    // ContainerService.init(this.registry, this.cache, this.context);
  }
}

export function container<TRegistryRecord extends RegistryRecord>(
  m: ModuleBuilder<TRegistryRecord>,
  ctx?: any,
): Container<TRegistryRecord> {
  let container = new Container((m as any).registry, new ContainerCache(), ctx);
  container.init();
  return container as any;
}
