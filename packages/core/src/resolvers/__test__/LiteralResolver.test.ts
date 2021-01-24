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
      const m = ModuleBuilder.empty('child')
        .define('val1', value(123))
        .define(
          'val2',
          literal(() => true),
        );

      type Actual = Module.Materialized<typeof m>['val2'];

      expectType<TypeEqual<Actual, boolean>>(true);
    });

    it(`uses correct materialized module type`, async () => {
      const m = ModuleBuilder.empty('child')
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
      const m = unit('a').define(
        'literal',
        literal(() => 'someValue'),
      );
      const c = container();
      expect(c.get(m, 'literal')).toEqual('someValue');
    });
  });

  describe(`using dependencies from the same module`, () => {
    it(`returns correct instance`, async () => {
      const m = unit('a')
        .define('literalDependency', value('dependency'))
        .define(
          'literal',
          literal(({ literalDependency }) => literalDependency),
        );
      const c = container();
      expect(c.get(m, 'literal')).toEqual('dependency');
    });
  });

  describe(`getting dependencies from imported module`, () => {
    it(`returns correct instance`, async () => {
      const childM = unit('childM').define(
        'someValue',
        literal(() => 1),
      );

      const parentM = unit('parentM')
        .import('imported', childM)
        .define(
          'usesImportedValue',
          literal(({ imported }) => imported.someValue),
        );

      const c = container();
      expect(c.get(parentM, 'usesImportedValue')).toEqual(1);
    });
  });

  describe(`overrides`, () => {
    it(`works with overridden imported module`, async () => {
      const childM = unit('childM').define(
        'someValue',
        literal(() => 1),
      );

      const parentM = unit('parentM')
        .import('imported', childM)
        .define(
          'usesImportedValue',
          literal(({ imported }) => imported.someValue),
        );

      const c = container({ overrides: [childM.replace('someValue', value(123))] });
      expect(c.get(parentM, 'usesImportedValue')).toEqual(123);
    });
  });

  describe(`transient scope`, () => {
    it(`returns new instance on each request`, async () => {
      const mod = unit('childM').define(
        'someValue',
        literal(() => ({ someProperty: 1 }), Scope.transient),
      );

      const c = container();
      expect(c.get(mod, 'someValue')).not.toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`singleton scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit('childM').define(
        'someValue',
        literal(() => ({ someProperty: 1 }), Scope.singleton),
      );

      const c = container();
      expect(c.get(mod, 'someValue')).toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`request scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit('childM')
        .define(
          'someValue',
          literal(() => ({ someProperty: 1 }), Scope.request),
        )
        .define(
          'someValueProxy',
          literal(({ someValue }) => someValue, Scope.request),
        );

      const c = container();
      const { someValue, someValueProxy } = c.asObject(mod);
      expect(someValue === someValueProxy).toEqual(true)

      const { someValue: someValueNewRequest, someValueProxy: someValueProxyNewRequest } = c.asObject(mod);
      expect(someValueNewRequest).toBe(someValueProxyNewRequest);
      expect(someValueNewRequest === someValue).toBe(false)
    });
  });
});
