import { scoped } from './definitions/definitions.js';
import { value } from './definitions/sync/value.js';
import type { Instance } from './definitions/abstract/sync/InstanceDefinition.js';
import type { AnyInstanceDefinition } from './definitions/abstract/AnyInstanceDefinition.js';

type Materialize<TDefinitions extends Record<string, AnyInstanceDefinition<any, any>>> = {
  [K in keyof TDefinitions]: Instance<TDefinitions[K]>;
};

class Module<TDefinitions extends Record<string, AnyInstanceDefinition<any, any>>> {
  constructor(private name: string) {}

  register<TName extends string, TArgs extends any[], TRet, TInstance>(
    name: TName,
    definition: (instance: TInstance, ...args: TArgs) => TRet,
    instance: TInstance,
    // ...args: TArgs
    args: (ctx: TDefinitions) => [...TArgs],
  ): Module<TDefinitions & Record<TName, TRet>> {
    // return this;
    throw new Error('Implement me!');
  }

  register2<TName extends string, TArg, TArgs extends TArg[], TRet, TInstance>(
    name: TName,
    params: {
      definition: (instance: TInstance, ...args: TArgs) => TRet;
      instance: TInstance;
      deps: (ctx: TDefinitions) => [...TArgs];
    },
  ): Module<TDefinitions & Record<TName, TRet>> {
    // return this;
    throw new Error('Implement me!');
  }
}

const a = new Module('test');

const zz = value(123);

// const withValue = a.register('someValue', value, 123);

const withValue223 = a.register2('someValue', {
  definition: value,
  instance: 123,
  deps: ctx => [],
});

const withValue2 = a.register(
  'someValue',
  scoped.partial,
  (a: string, b: string) => 123,
  () => [value('sdf')],
);

const withValue2s = a.register(
  'someValue',
  scoped.partial,
  (a: string, b: string) => 123,
  () => [],
);

const myFunc = (a: string, b: string) => 123;
const myFunc2 = (a: string, b: string) => 'someString';
// const partialFun

const withValue3 = a;
// .register2('someValue1', {
//   definition: scoped.partial,
//   instance: myFunc2,
//   deps: ctx => [value('a')],
// })
// .register2('someValue', {
//   definition: scoped.fn,
//   instance: myFunc2,
//   deps: ctx => [value('a'), value('asdf')],
// })
// .register2('someValue2', {
//   definition: scoped.fn,
//   instance: myFunc,
//   deps: ctx => [ctx.someValue, ctx.someValue],
// });
