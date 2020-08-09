import { AbstractDependencyResolver } from "./AbstractDependencyResolver";
import { ContainerCache } from "../container/container-cache";

export class TransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: any) {
    super();
  }

  build(cache: ContainerCache): TReturn {
    throw new Error('implement me');
    // return this.resolver(ContainerService.proxyGetter(registry, cache, {}));
  }
}

export const transient = <TKey extends string, TValue>(key: TKey, value: () => TValue): TransientResolver<TValue> => {
  return new TransientResolver(value);
};
