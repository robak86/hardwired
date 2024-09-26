import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';
import { fn } from './definitions.js';
import { BaseDefinition } from './abstract/FnDefinition.js';
import { use } from '../container/Container.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

export const cls = <TInstance, TConstructorArgs extends any[]>(
  klass: ClassType<TInstance, TConstructorArgs>,
  deps: InstancesDefinitions<TConstructorArgs>,
): BaseDefinition<TInstance, any, any, any> => {
  return fn(use => {
    return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
  });
};

const num = fn(() => 123);
const str = fn(() => '123');

class MyClass {
  static instance = cls(this, [num, str]);

  constructor(
    public readonly a: number,
    public readonly b: string,
  ) {}

  hello() {
    console.log('Hello, World!');
  }
}

use(MyClass.instance).hello();
