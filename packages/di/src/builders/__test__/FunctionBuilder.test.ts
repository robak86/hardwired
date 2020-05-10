import { module } from '../../module/Module';
import { fun, FunctionModuleBuilder } from '../FunctionBuilder';
import { expectType, TypeEqual } from 'ts-expect';
import { Definition } from '../../module/ModuleRegistry';
import { container } from '../../container/Container';
import { ModuleBuilder, ModuleBuilderRegistry } from '../ModuleBuilder';
import { imports } from '../ImportsBuilder';
import { singleton } from '../SingletonBuilder';

describe(`FunctionBuilder`, () => {
  describe(`types`, () => {
    it(`correctly propagates TRegistry`, async () => {
      const m: ModuleBuilder<{ a: Definition<number> }> = module('someModule') as any;
      const nextModule = m.using(fun);
      expectType<TypeEqual<ModuleBuilderRegistry<typeof nextModule>, { a: Definition<number> }>>(true);
    });

    it(`creates correct module type for function without any dependencies`, async () => {
      const someFunction = () => 123;
      const m = module('m1').using(fun).define('noDepsFunction', someFunction);
      expectType<TypeEqual<typeof m, FunctionModuleBuilder<{ noDepsFunction: Definition<() => number> }>>>(true);
    });

    it(`creates correct module type for function with single parameter`, async () => {
      const someFunction = (someParam: string) => 123;
      const m = module('m1').using(fun).define('noDepsFunction', someFunction);
      expectType<TypeEqual<typeof m, FunctionModuleBuilder<{ noDepsFunction: Definition<(param: string) => number> }>>>(
        true,
      );
    });

    it(`creates correct types using dependencies from imported modules`, async () => {
      const someFunction = (someParam: string) => 123;
      const imported = module('imported')
        .using(fun)
        .define(
          'importedFunction',
          () => 'someString',
          ctx => ['someString'],
        );

      const m = module('m1')
        .using(imports)
        .import('otherModule', imported)
        .using(fun)
        .define('noDepsFunction', someFunction, c => [c.otherModule.importedFunction()]);

      expectType<
        TypeEqual<
          ModuleBuilderRegistry<typeof m>,
          {
            noDepsFunction: Definition<() => number>;
            otherModule: ModuleBuilder<ModuleBuilderRegistry<typeof imported>>;
          }
        >
      >(true);
    });

    it(`creates correct module type for function with single parameter with all deps provided`, async () => {
      const someFunction = (someParam: string) => 123;
      const m = module('m1')
        .using(singleton)
        .define('someString', () => 'someString')
        .using(fun)
        .define('noDepsFunction', someFunction, ctx => [ctx.someString]);

      expectType<
        TypeEqual<
          typeof m,
          FunctionModuleBuilder<{ someString: Definition<string>; noDepsFunction: Definition<() => number> }>
        >
      >(true);
    });

    it(`creates correct module type for function with two parameters with no deps provided`, async () => {
      const someFunction = (someParam: string, someOtherParam: number) => 123;
      const m = module('m1')
        .using(singleton)
        .define('someString', () => 'someString')
        .define('someNumber', () => 123)
        .using(fun)
        .define('noDepsFunction', someFunction);

      expectType<
        TypeEqual<
          typeof m,
          FunctionModuleBuilder<{
            someString: Definition<string>;
            someNumber: Definition<number>;
            noDepsFunction: Definition<(d1: string, d2: number) => number>;
          }>
        >
      >(true);
    });

    it(`creates correct module type for function with two parameters with all deps provided`, async () => {
      const someFunction = (someParam: string, someOtherParam: number) => 123;
      const m = module('m1')
        .using(singleton)
        .define('someString', () => 'someString')
        .define('someNumber', () => 123)
        .using(fun)
        .define('noDepsFunction', someFunction, ctx => [ctx.someString, ctx.someNumber]);

      expectType<
        TypeEqual<
          typeof m,
          FunctionModuleBuilder<{
            someString: Definition<string>;
            someNumber: Definition<number>;
            noDepsFunction: Definition<() => number>;
          }>
        >
      >(true);
    });
  });

  describe(`instantiation`, () => {
    const someFunction = (someParam: string, someOtherParam: number) => [someParam, someOtherParam];
    const m = module('m1')
      .using(singleton)
      .define('d1', () => 'dependency1')
      .define('d2', () => 123)
      .using(fun)
      .define('curry0', someFunction)
      .define('curry1', someFunction, ctx => [ctx.d1])
      .define('curry2', someFunction, ctx => [ctx.d1, ctx.d2]);

    it(`returns correctly curried functions`, async () => {
      const c = container(m);

      expect(c.get('curry0')('string', 123)).toEqual(['string', 123]);
      expect(c.get('curry1')(123)).toEqual(['dependency1', 123]);
      expect(c.get('curry2')()).toEqual(['dependency1', 123]);
    });

    it(`caches curried functions`, async () => {
      const c = container(m);

      expect(c.get('curry0')).toEqual(c.get('curry0'));
      expect(c.get('curry1')).toEqual(c.get('curry1'));
      expect(c.get('curry2')).toEqual(c.get('curry2'));
    });
  });
});
