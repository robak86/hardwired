import { ClassType } from './utils/ClassType';
import { SingletonStrategy } from './strategies/SingletonStrategy';
import { TransientStrategy } from './strategies/TransientStrategy';
import { BuildStrategy } from './strategies/abstract/BuildStrategy';
import { InstancesCache } from './context/InstancesCache';
import { ResolversRegistry } from './context/ResolversRegistry';

type ContainerContext = {
  ctx: 1;
};

type Module<T> = {
  inner: T;
};

class Cls0 {
  kind: 'cls0' = 'cls0';
}
class Cls1 {
  constructor(arg1: Cls0) {}
}
class Cls2 {
  constructor(arg1: Cls0, arg2: Cls1) {}
}

type InstanceResolver<T> = {
  strategy: string;
  factory: (ctx: ContainerContext) => T;
};

declare const container: any;

declare function module<T extends Record<string, InstanceResolver<any>>>(define: () => T): T;



declare const replace: <TValue, T extends InstanceResolver<TValue>>(
  original: T,
  newValue: InstanceResolver<TValue>,
) => InstanceResolver<TValue>;

// declare const singleton: any;
declare const MyClass: any;

declare const singleton: <TValue, TDeps extends any[]>(
  cls: ClassType<TValue, TDeps>,
  deps: { [K in keyof TDeps]: InstanceResolver<TDeps[K]> },
) => InstanceResolver<TValue>;

declare const customResolver: <TValue, TDeps extends any[]>(
  cls: ClassType<TValue, TDeps>,
  deps: { [K in keyof TDeps]: InstanceResolver<TDeps[K]> },
) => InstanceResolver<TValue>;

export const otherModule = module(function () {
  const someSingleton = singleton(Cls0, []);

  return { someSingleton };
});

// one can call some side effects in wire function - wire is called only once so potential bug should be still fairly easy to track
// How about parametrized modules ?
export const someModule = module(function wire() {
  const dep1 = singleton(Cls1, [otherModule.someSingleton]);
  const dep2 = customResolver(Cls2, [otherModule.someSingleton, dep1]);

  return {
    dep1,
    dep2,
  };
});

class CustomBuild implements BuildStrategy<any> {
  readonly __TValue: any;
  readonly tags: symbol[] = null as any;

  build(id: string, context: InstancesCache, resolvers: ResolversRegistry, materializedModule): any {
    throw new Error('Implement me!');
  }
}

const ctn = container({
  singleton: SingletonStrategy,
  transient: TransientStrategy,
  custom: CustomBuild,
});

const scoped = ctn.scope([
  replace(otherModule.someSingleton, singleton(Cls0, [])),
  () => {
    // use other modules?
    return replace(otherModule.someSingleton, singleton(Cls0, []));
  },
]);
