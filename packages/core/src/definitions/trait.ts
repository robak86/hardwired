import { InstanceDefinition } from './abstract/sync/InstanceDefinition.js';
import { LifeTime } from './abstract/LifeTime.js';

declare const singleton: any;

declare const trait: any;
declare const loggerImpl: any;

const loggerDef = singleton.fn(() => loggerImpl);
const requestDefinition = singleton.fn();

// const Logger = trait([loggerDef], class extends base {
// const Logger = trait([], [loggerDef], base => class extends base {
//     constructor(private loggerImpl) {
//         super();
//     }
//
//     info() {}
//     warn() {}
//
// })
//
//
// const Req = trait( [requestDefinition], [LoggerDef], base => class extends base {
//     constructor(private req) {
//         this.info() // comming from LoggerDef that is mixed into this
//     }
//
//     payload(){}
//     response(){}
// })

// ---------------V2

const baseInputDef = singleton.fn(() => 1);

type BaseType = {
  myk: 1;
};

const m0 = (baseInput: BaseType) => {
  return {
    a: 1,
    b: 2,
  };
};

const m00Def = singleton.mixin(m0);
const m0Def = singleton.mixin(m0);

// no need for special, MixinType, because we only use the returned value
const m1 = (base: ReturnType<typeof m0>) => {
  // base can be early called here - so we need to care about the order of mixins composition
  return {};
};

// no need for wrapping each function with mixin
// each mixin is easy to test
// impossible to replace a fragment of mixin with integration tests
const m1Def = singleton.mix([baseInputDef], m0, m1); // the order of mixin dependencies matters - check if it is possible to make it type-safe

// each mixin is wrapped in definition
// it's easy to replace in integration tests
// creates boilerplate.
const m2Def = singleton.mix([m00Def, m0Def], m1); // the order of mixin dependencies matters - check if it is possible to make it type-safe

// combined approach
// mixin is created using singleton|request|...|.mixin and it returns instance definition with callable mixin itself

const mixin = <TInput, TInstance>(
  mixinFn: (input: TInput) => TInstance,
): InstanceDefinition<TInstance, LifeTime.singleton> & ((input: TInput) => TInstance) => {
  throw new Error('Implement me!');
};

const m00 = mixin((baseInput: BaseType) => {
  return {
    a: 1,
    b: 2,
  };
});
