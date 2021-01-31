import { ModuleBuilder, unit } from '../../module/ModuleBuilder';
import { literal } from '../LiteralResolver';
import { container } from '../../container/Container';
import { value } from '../ValueResolver';
import { Module } from '../abstract/Module';
import { expectType, TypeEqual } from 'ts-expect';
import { Scope } from '../abstract/Instance';

describe(`LiteralResolver`, () => {
  describe(`types`, () => {
    it(`return defines correct return type`, async () => {
      const m = ModuleBuilder.empty()
        .define('val1', value(123))
        .define(
          'val2',
          literal(() => true),
        )
        .freeze();

      type Actual = Module.Materialized<typeof m>['val2'];

      expectType<TypeEqual<Actual, boolean>>(true);
    });

    it(`uses correct materialized module type`, async () => {
      const m = ModuleBuilder.empty()
        .define('val1', value(123))
        .define(
          'val2',
          literal(materializedModule => {
            expectType<TypeEqual<typeof materializedModule, { val1: number }>>(true);
          }),
        );
    });
  });

  describe(`no dependencies`, () => {
    it(`returns correct instance`, async () => {
      const m = unit()
        .define(
          'literal',
          literal(() => 'someValue'),
        )
        .freeze();
      const c = container();
      expect(c.get(m, 'literal')).toEqual('someValue');
    });
  });

  describe(`using dependencies from the same module`, () => {
    it(`returns correct instance`, async () => {
      const m = unit()
        .define('literalDependency', value('dependency'))
        .define(
          'literal',
          literal(({ literalDependency }) => literalDependency),
        )
        .freeze();
      const c = container();
      expect(c.get(m, 'literal')).toEqual('dependency');
    });
  });

  describe(`getting dependencies from imported module`, () => {
    it(`returns correct instance`, async () => {
      const childM = unit()
        .define(
          'someValue',
          literal(() => 1),
        )
        .freeze();

      const parentM = unit()
        .import('imported', childM)
        .define(
          'usesImportedValue',
          literal(({ imported }) => imported.someValue),
        )
        .freeze();

      const c = container();
      expect(c.get(parentM, 'usesImportedValue')).toEqual(1);
    });
  });

  describe(`overrides`, () => {
    it(`works with overridden imported module`, async () => {
      const childM = unit()
        .define(
          'someValue',
          literal(() => 1),
        )
        .freeze();

      const parentM = unit()
        .import('imported', childM)
        .define(
          'usesImportedValue',
          literal(({ imported }) => imported.someValue),
        )
        .freeze();

      const c = container({ overrides: [childM.replace('someValue', value(123))] });
      expect(c.get(parentM, 'usesImportedValue')).toEqual(123);
    });
  });

  describe(`transient scope`, () => {
    it(`returns new instance on each request`, async () => {
      const mod = unit()
        .define(
          'someValue',
          literal(() => ({ someProperty: 1 }), Scope.transient),
        )
        .freeze();

      const c = container();
      expect(c.get(mod, 'someValue')).not.toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`singleton scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit()
        .define(
          'someValue',
          literal(() => ({ someProperty: 1 }), Scope.singleton),
        )
        .freeze();

      const c = container();
      expect(c.get(mod, 'someValue')).toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`request scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit()
        .define(
          'someValue',
          literal(() => ({ someProperty: Math.random() }), Scope.request),
        )
        .define(
          'someValueProxy',
          literal(({ someValue }) => someValue, Scope.request),
        )
        .freeze();

      const c = container();
      const req1 = c.asObject(mod);
      const req2 = c.asObject(mod);

      expect(req1.someValue === req1.someValueProxy).toEqual(true);
      expect(req2.someValue === req2.someValueProxy).toEqual(true);
      expect(req1 === req2).toEqual(true);
    });
  });
});
