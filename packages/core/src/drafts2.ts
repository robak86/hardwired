import { ClassType } from './utils/ClassType';

import { InstancesCache } from './context/InstancesCache';

type ContainerContext = {
  ctx: 1;
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


export type InstanceEntryDraft<T, TExternal = never> = {
  id: string; // should be unique and prefixed with function name, class name (something which will make debugging easier)
  strategy: symbol; // this enables basic reflection :D just recursively iterate over dependencies array :D
  target: () => ClassType<T, any> | T; // thunk returning class reference, function, or const value.
  // Decision how the target should be interpreted and how it should be instantiated (if necessary) will be delegated to strategy implementation
  dependencies: Array<InstanceEntryDraft<any>>;
};

declare const container: any;

declare function module<T extends Record<string, InstanceEntryDraft<any>>>(define: () => T): Readonly<T>; // if we return an object- then we would need to use strings to access module definitions

/*
why we don't wanna provide use
- it requires to introduce additional aliases in wire function block
- it requires module to return Module object - instead of Record<string, InstanceDefinition<any>> - and in consequence we would need to use string access to definitions
- external params may still be propagated to composition root using just mapped types over Record<string, InstanceDefinition<any>> and in instance resolvers factories (e.g. singleton - propagating external params from resolvers array)
 */

// declare function use<T>(mod: Module<T, []>): T;
// declare function use<T, TParams extends any[]>(mod: Module<T, TParams>, params: TParams): T;

declare const replace: <TValue, T extends InstanceEntryDraft<TValue>>(
  original: T,
  newValue: InstanceEntryDraft<TValue>,
) => InstanceEntryDraft<TValue>;

// declare const singleton: any;
declare const MyClass: any;

// it should throw if called outside wire function
declare const singleton: <TValue, TDeps extends any[]>(
  cls: ClassType<TValue, TDeps>,
  deps: { [K in keyof TDeps]: InstanceEntryDraft<TDeps[K]> },
) => InstanceEntryDraft<TValue>;

declare const customResolver: <TValue, TDeps extends any[]>(
  cls: ClassType<TValue, TDeps>,
  deps: { [K in keyof TDeps]: InstanceEntryDraft<TDeps[K]> },
) => InstanceEntryDraft<TValue>;

export const otherModule = module(function () {
  const someSingleton = singleton(Cls0, []);

  return { someSingleton }; //js has literal objects - we should leverage it instead using map-like methods (.define, .bind, .replace)
});

// each strategy (e.g. singleton) may have conditional type for such interface (or parametrized factory) and propagate TParams to composition root
interface IParametrized<TParams> {
  init(params: TParams);
}

// one can call some side effects in wire function - wire is called only once so potential bug should be still fairly easy to track
// How about parametrized modules ?  ctn.getAll(someModule, moduleParamsObject) - this would enforce all (service-locator-like) consumers to know the details required for module initialization :/
// How about parametrized modules ?  ctn.get(someModule.someDefinition, moduleParamsObject) - this may be tricky - how we should handle parametrized singletons ? should use memoization ?
// having memoization on parametrized modules we wouldn't need scopes concept.
export const someModule = module(function wire() {
  const dep1 = singleton(Cls1, [otherModule.someSingleton]); // this may require some additional external params, and we can collect all external params from all strategies returned from wire function
  const dep2 = customResolver(Cls2, [otherModule.someSingleton, dep1]);

  return {
    dep1,
    dep2,
  };
});


// class CustomBuild implements BuildStrategy<any> {
//   readonly __TValue: any;
//   readonly tags: symbol[] = null as any;
//
//   build(id: string, context: InstancesCache, resolvers, materializedModule): any {
//     throw new Error('Implement me!');
//   }
// }

// this will enable using different strategies implementation depending on environment of framework (node|browser|react)
// e.g. some strategy could store it's instance in react's useState ? :D
// const ctn = container({
//   singleton: SingletonStrategyLegacy,
//   transient: TransientStrategyLegacy,
//   custom: CustomBuild,
// });
//
// // ctn.get(someModule.someDefinitionUsingCustomStrategy) - in theory we can make it type-safe and throw compile error
// // when customStrategy is not registered in container... but it would introduce complexity to types, which is not worth it
//
// const scoped = ctn.scope([
//   replace(otherModule.someSingleton, singleton(Cls0, [])),
//   () => {
//     // use other modules?
//     return replace(otherModule.someSingleton, singleton(Cls0, []));
//   },
// ]);
