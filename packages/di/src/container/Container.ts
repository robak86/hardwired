import { unwrapThunk } from '../utils/thunk';
import { proxyGetter } from './proxyGetter';
import { ContainerCache } from './container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';
import {
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryContext,
  ModuleRegistryDefinitions,
  ModuleRegistryDefinitionsKeys,
} from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { ContainerService } from './ContainerService';

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

export type DeepGetReturn<
  K extends keyof MaterializedDefinitions<TModuleRegistry>,
  TModuleRegistry extends ModuleRegistry,
  TContainerRegistry extends ModuleRegistry
> = ModuleRegistryContext<TContainerRegistry> extends ModuleRegistryContext<TModuleRegistry>
  ? MaterializedModuleEntries<TModuleRegistry>[K]
  : DeepGetReturnErrorMessage;

export class Container<R extends ModuleRegistry = {}, C = {}> {
  constructor(
    private registry: DefinitionsSet<R>,
    private cache: ContainerCache = new ContainerCache(),
    private context?: C,
  ) {}

  get = <K extends ModuleRegistryDefinitionsKeys<R>>(key: K): MaterializedDefinitions<R>[K] => {
    return ContainerService.getChild(this.registry, this.cache.forNewRequest(), this.context, key as any);
  };

  getMany: GetMany<ModuleRegistryDefinitions<R>> = (...args: any[]) => {
    const cache = this.cache.forNewRequest();

    return args.map(dep => {
      return ContainerService.getChild(this.registry, cache, this.context, dep);
    }) as any;
  };

  asObject(): MaterializedModuleEntries<R> {
    return proxyGetter(this.registry, this.cache.forNewRequest(), this.context);
  }

  checkout(inherit: boolean): Container<R> {
    if (inherit) {
      return new Container(this.registry, this.cache, this.context); // TODO: we should return this.cache.clone() otherwise this checkout without inheritance does not make any sense
    } else {
      return new Container(this.registry, new ContainerCache(), this.context);
    }
  }

  // TODO: this may breaks the encapsulation!!! is this really required ? it's not type safe!
  deepGet<TNextR extends ModuleRegistry, K extends keyof MaterializedDefinitions<TNextR>>(
    module: ModuleBuilder<TNextR>,
    key: K,
  ): DeepGetReturn<K, TNextR, R> {
    //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered
    let childModule: DefinitionsSet<any> | undefined = this.registry.isEqual(module.registry)
      ? this.registry
      : unwrapThunk(this.findModule(module.registry));

    if (!childModule) {
      console.warn('deepGet called with module which is not imported by any descendant module');
      childModule = module.registry;
    }

    ContainerService.init(childModule, this.cache, this.context);
    return ContainerService.getChild(childModule, this.cache, this.context, key as string);
  }

  private findModule(moduleIdentity: DefinitionsSet<any>): DefinitionsSet<any> | undefined {
    return this.registry.findModule(moduleIdentity);
  }

  public init() {
    ContainerService.init(this.registry, this.cache, this.context);
  }
}

export function container<TRegistry extends ModuleRegistry>(
  m: ModuleBuilder<TRegistry>,
  ctx?: any,
): Container<TRegistry> {
  return new Container((m as any).registry, new ContainerCache(), ctx);
}
