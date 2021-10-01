import { ModuleBuilder, unit } from '../../module/ModuleBuilder';

import { container } from '../../container/Container';
import { Module } from '../../module/Module';
import { expectType, TypeEqual } from 'ts-expect';
import { transient } from '../TransientStrategyLegacy';
import { request } from '../RequestStrategyLegacy';
import { singleton } from '../SingletonStrategyLegacy';

describe(`LiteralResolver`, () => {
  describe(`types`, () => {
    it(`return defines correct return type`, async () => {
      const m = ModuleBuilder.empty()
        .define('val1', singleton, () => 123)
        .define('val2', singleton, () => true)
        .build();

      type Actual = Module.Materialized<typeof m>['val2'];

      expectType<TypeEqual<Actual, boolean>>(true);
    });

    it(`uses correct materialized module type`, async () => {
      const m = ModuleBuilder.empty()
        .define('val1', singleton, () => 123)
        .define('val2', singleton, materializedModule => {
          expectType<TypeEqual<typeof materializedModule, { val1: number }>>(true);
        });
    });
  });

  describe(`no dependencies`, () => {
    it(`returns correct instance`, async () => {
      const m = unit()
        .define('literal', singleton, () => 'someValue')
        .build();
      const c = container();
      expect(c.get(m, 'literal')).toEqual('someValue');
    });
  });

  describe(`using dependencies from the same module`, () => {
    it(`returns correct instance`, async () => {
      const m = unit()
        .define('literalDependency', singleton, () => 'dependency')
        .define('literal', singleton, ({ literalDependency }) => literalDependency)
        .build();
      const c = container();
      expect(c.get(m, 'literal')).toEqual('dependency');
    });
  });

  describe(`getting dependencies from imported module`, () => {
    it(`returns correct instance`, async () => {
      const childM = unit()
        .define('someValue', singleton, () => 1)
        .build();

      const parentM = unit()
        .import('imported', childM)
        .define('usesImportedValue', singleton, ({ imported }) => imported.someValue)
        .build();

      const c = container();
      expect(c.get(parentM, 'usesImportedValue')).toEqual(1);
    });
  });

  describe(`overrides`, () => {
    it(`works with overridden imported module`, async () => {
      const childM = unit()
        .define('someValue', singleton, () => 1)
        .build();

      const parentM = unit()
        .import('imported', childM)
        .define('usesImportedValue', singleton, ({ imported }) => imported.someValue)
        .build();

      const c = container({ scopeOverrides: [childM.replace('someValue', () => 123)] });
      expect(c.get(parentM, 'usesImportedValue')).toEqual(123);
    });
  });

  describe(`transient scope`, () => {
    it(`returns new instance on each request`, async () => {
      const mod = unit()
        .define('someValue', transient, () => ({ someProperty: 1 }))
        .build();

      const c = container();
      expect(c.get(mod, 'someValue')).not.toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`singleton scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit()
        .define('someValue', singleton, () => ({ someProperty: 1 }))

        .build();

      const c = container();
      expect(c.get(mod, 'someValue')).toBe(c.get(mod, 'someValue'));
    });
  });

  describe(`request scope`, () => {
    it(`returns the same instance`, async () => {
      const mod = unit()
        .define('someValue', request, () => ({ someProperty: Math.random() }))
        .define('someValueProxy', request, ({ someValue }) => someValue)
        .build();

      const c = container();
      const req1 = c.asObject(mod);
      const req2 = c.asObject(mod);

      expect(req1.someValue === req1.someValueProxy).toEqual(true);
      expect(req2.someValue === req2.someValueProxy).toEqual(true);
      expect(req1.someValue).not.toEqual(req2.someValue);
      expect(req1.someValueProxy).not.toEqual(req2.someValueProxy);
    });
  });
});
