import { module } from '../../module/Module';
import { expectType, TypeEqual } from 'ts-expect';
import { Definition } from '../../module/ModuleRegistry';
import { container } from '../../container/Container';
import { ModuleBuilder, ModuleBuilderRegistry } from '../ModuleBuilder';
import { CommonBuilder } from '../CommonDefines';

describe(`FunctionBuilder`, () => {
  describe(`types`, () => {
    it(`creates correct module type for function without any dependencies`, async () => {
      const someFunction = () => 123;
      const m = module('m1').function('noDepsFunction', someFunction);
      expectType<TypeEqual<typeof m, CommonBuilder<{ noDepsFunction: Definition<() => number> }>>>(true);
    });

    it(`creates correct module type for function with single parameter`, async () => {
      const someFunction = (someParam: string) => 123;
      const m = module('m1').function('noDepsFunction', someFunction);
      expectType<TypeEqual<typeof m, CommonBuilder<{ noDepsFunction: Definition<(param: string) => number> }>>>(true);
    });

    it(`creates correct types using dependencies from imported modules`, async () => {
      const someFunction = (someParam: string) => 123;
      const imported = module('imported').function(
        'importedFunction',
        () => 'someString',
        ctx => ['someString'],
      );

      const m = module('m1')
        .import('otherModule', imported)
        .function('noDepsFunction', someFunction, c => [c.otherModule.importedFunction()]);

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
        .value('someString', 'someString')
        .function('noDepsFunction', someFunction, ctx => [ctx.someString]);

      expectType<
        TypeEqual<typeof m, CommonBuilder<{ someString: Definition<string>; noDepsFunction: Definition<() => number> }>>
      >(true);
    });

    it(`creates correct module type for function with two parameters with no deps provided`, async () => {
      const someFunction = (someParam: string, someOtherParam: number) => 123;
      const m = module('m1')
        .value('someString', 'someString')
        .value('someNumber', 123)
        .function('noDepsFunction', someFunction);

      expectType<
        TypeEqual<
          typeof m,
          CommonBuilder<{
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
        .value('someString', 'someString')
        .value('someNumber', 123)
        .function('noDepsFunction', someFunction, ctx => [ctx.someString, ctx.someNumber]);

      expectType<
        TypeEqual<
          typeof m,
          CommonBuilder<{
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
      .value('d1', 'dependency1')
      .value('d2', 123)
      .function('curry0', someFunction)
      .function('curry1', someFunction, ctx => [ctx.d1])
      .function('curry2', someFunction, ctx => [ctx.d1, ctx.d2]);

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
