import {
  classRequest,
  classScoped,
  classSingleton,
  classTransient,
  requestFn,
  scopedFn,
  singletonFn,
  transientFn,
} from './classStrategies';
import { classDefinition, FunctionFactoryDefinition, InstanceDefinition } from '../abstract/InstanceDefinition';
import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../ServiceLocatorStrategy';

export const singleton = {
  fn: singletonFn,
  class: classSingleton,
};

export const transient = {
  fn: transientFn,
  class: classTransient,
};

export const request = {
  fn: requestFn,
  class: classRequest,
};

export const scoped = {
  fn: scopedFn,
  class: classScoped,
};

export const serviceLocator = classDefinition(ServiceLocator, ServiceLocatorStrategy.type, [] as any);

declare function sin1<TValue, TDeps extends any[]>(
  ...args: [...{ [K in keyof TDeps]: InstanceDefinition<TDeps[K]> }, (...args: TDeps) => TValue]
): FunctionFactoryDefinition<TValue>;

declare function sin<TValue, TDeps extends any[]>(
    factory: (...args: TDeps) => TValue,
    ...args: [...{ [K in keyof TDeps]: InstanceDefinition<TDeps[K]> }[]]
): FunctionFactoryDefinition<TValue>;


// TODO: IT WORKS!!!
function sinImpl<TValue, TDeps extends any[]>(factory: () => TValue, args: []): FunctionFactoryDefinition<TValue>;
function sinImpl<TValue, TDeps extends any[], TArg>(
  factory: (...args: [TArg]) => TValue,
  args: [InstanceDefinition<TArg>],
): FunctionFactoryDefinition<TValue>;
function sinImpl<TValue, TDeps extends any[], TArg, TFunctionArgs extends [TArg, ...TArg[]]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
function sinImpl<TValue, TDeps extends any[], TArg, TFunctionArgs extends [TArg, ...TArg[]]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> } | [] | [InstanceDefinition<any>],
): FunctionFactoryDefinition<TValue> {
  throw new Error('Implement me!');
}

const strDef = sin(() => 'str');
const numberDef = sin(() => 123);
const wtf = sin( (a, b) => null, [strDef, numberDef]);

function add<T extends any[]>(args: T): T {
  console.log(args);
  throw new Error('Implement me!');
}

const zz = add([1, 2, 3, 4]);
