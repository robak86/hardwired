import { singleton } from '../resolvers/ClassSingletonResolver';
import { ModuleBuilder } from './ModuleBuilder';
import { Instance } from '../resolvers/abstract/AbstractResolvers';
import { value, ValueResolver } from '../resolvers/ValueResolver';
import { ClassType } from '../utils/ClassType';

class SomeClass {
  constructor(public params: { a: number; b: string }) {}
}
class TestClass {
  constructor(private a: number, private b: string) {}
}

const dummy = <TValue>(value: TValue): Instance<TValue, []> => {
  return new ValueResolver(value);
};

const dummyClassResolver = <TDeps extends any[], TValue>(cls: ClassType<TDeps, TValue>): Instance<TValue, TDeps> => {
  return singleton(cls);
};

// const wtf = singleton(SomeClass);
//
// const m1 = m.define('a', value('string')).define('b', value(123));

// const m2 = ModuleBuilder.empty('someModule')
// .define('a', value('string'))
// .define('b', value(123))
// .define('c', singleton(TestClass))
// .defineStructured('singleton', wtf, { a: 'a', c: 'a' });
//
// type WTF = PropTypesObject<typeof m2, MaterializeModule<typeof m1>>;

const m2 = ModuleBuilder.empty('someModule').define('string', value('string')).define('number', value(123));

m2.define('cls', dummyClassResolver(TestClass), ['number', 'string']);

// @ts-expect-error - dependencies were passed in the wrong order
m2.define('cls', dummyClassResolver(TestClass), ['string', 'number']);

// @ts-expect-error - on of the dependencies is missing
m2.define('cls', dummyClassResolver(TestClass), ['number']);

// @ts-expect-error - dependencies array is empty
m2.define('cls', dummyClassResolver(TestClass), []);

m2.define('asdf', singleton(SomeClass), { a: 'number', b: 'string' });

m2.define('cls', singleton(TestClass), ['number', 'string']);
m2.define('cls', singleton(SomeClass), { a: 'number', b: 'string' });
