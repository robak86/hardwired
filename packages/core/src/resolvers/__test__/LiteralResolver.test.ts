import { unit } from '../../module/ModuleBuilder';
import { literal } from '../LiteralResolver';
import { container } from '../../container/Container';
import { value } from '../ValueResolver';

describe(`LiteralResolver`, () => {
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
});
