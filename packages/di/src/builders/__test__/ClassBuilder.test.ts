import { module } from '../../module/Module';
import { ClassBuilder, classInstance } from '../ClassBuilder';
import { expectType, TypeEqual } from 'ts-expect';
import { Definition } from '../../module/ModuleRegistry';
import { container } from '../../container/Container';
import { singleton } from '../SingletonBuilder';
import { value } from '../ValueBuilder';

describe(`ClassBuilder`, () => {
  class Class0 {}
  class Class1 {
    constructor(public arg1: number) {}
  }
  class Class2 {
    constructor(public arg1: number, public arg2: string) {}
  }

  describe(`types`, () => {
    it(`creates module with correct generic types for class with no constructor args`, async () => {
      const m1 = module('m1').using(classInstance).define('class0', Class0);
      expectType<TypeEqual<typeof m1, ClassBuilder<{ class0: Definition<Class0> }>>>(true);
    });

    it(`creates module with correct generic types for class with 1 constructor arg`, async () => {
      const m1 = module('m1')
        .using(singleton)
        .define('d1', () => 123)
        .using(classInstance)
        .define('class1', Class1, ctx => [ctx.d1]);
      expectType<TypeEqual<typeof m1, ClassBuilder<{ class1: Definition<Class1>; d1: Definition<number> }>>>(true);
    });

    it(`creates module with correct generic types for class with 2 constructor arg`, async () => {
      const m1 = module('m1')
        .using(singleton)
        .define('d1', () => 123)
        .define('d2', () => '123')
        .using(classInstance)
        .define('class2', Class2, ctx => [ctx.d1, ctx.d2]);
      expectType<
        TypeEqual<
          typeof m1,
          ClassBuilder<{ class2: Definition<Class2>; d1: Definition<number>; d2: Definition<string> }>
        >
      >(true);
    });
  });

  describe(`instantiation`, () => {
    const m = module('m1')
      .using(value)
      .define('d1', 123)
      .define('d2', '123')
      .using(classInstance)
      .define('class2', Class2, ctx => [ctx.d1, ctx.d2]);

    const c = container(m);

    it(`returns instance of given class`, async () => {
      expect(c.get('class2')).toBeInstanceOf(Class2);
    });

    it(`instantiates class with correct params`, async () => {
      const class2 = c.get('class2');
      expect(class2.arg1).toEqual(c.get('d1'));
      expect(class2.arg2).toEqual(c.get('d2'));
    });

    it(`caches instance of the class`, async () => {
      expect(c.get('class2')).toEqual(c.get('class2'));
    });
  });
});