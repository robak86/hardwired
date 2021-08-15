import { module } from '../../module/ModuleBuilder';
import { singleton } from '../SingletonStrategy';
import { container } from '../../container/Container';
import { transient } from '../TransientStrategy';
import { request } from '../RequestStrategy';

describe(`ApplyResolver`, () => {
  class Boxed {
    constructor(public value) {}
  }

  it(`applies function to original value`, async () => {
    const m = module()
      .define('someValue', singleton, () => new Boxed(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1));

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(m, 'someValue').value).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const m = module()
      .define('someValue', singleton, () => new Boxed(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1));

    expect(container().get(m, 'someValue').value).toEqual(1);
    expect(container({ scopeOverrides: [mPatch] }).get(m, 'someValue').value).toEqual(2);
  });

  it(`allows for multiple apply functions calls`, async () => {
    const m = module()
      .define('someValue', singleton, () => new Boxed(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1)).apply('someValue', val => (val.value *= 3));

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(m, 'someValue').value).toEqual(6);
  });

  describe(`scopes`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const m = module()
        .define('a', singleton, () => Math.random())
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const m = module()
        .define('a', transient, () => Math.random())
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(m, 'a')).not.toEqual(c.get(m, 'a'));
    });

    it(`uses different request scope for each subsequent asObject call`, async () => {
      const m = module()
        .define('source', request, () => Math.random())
        .define('a', request, ({ source }) => source)
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      const req1 = c.asObject(m);
      const req2 = c.asObject(m);

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });

    it(`does not change original strategy`, async () => {
      const m = module()
        .define('a', request, () => Math.random())
        .define('b', request, () => Math.random())
        .build();

      const c = container();
      const obj1 = c.asObject(m);
      const obj2 = c.asObject(m);

      expect(obj1).not.toBe(obj2);
    });
  });

  describe(`overrides`, () => {
    it(`acts like replace in terms of module identity`, async () => {
      const m = module()
        .define('a', singleton, () => new Boxed(1))
        .build();

      const patchedMWithApply = m.apply('a', a => (a.value += 1));

      expect(m.isEqual(patchedMWithApply));
    });
  });
});
