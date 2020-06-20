import { expectType, TypeEqual } from 'ts-expect';

import { trait } from '../traitNew';
import { Trait } from '../trait';

describe(`trait`, () => {
  type P1 = { p1: string };
  type P1Namespaced = { pn1: P1 };

  type P2 = { p2: string };
  type P2Namespaced = { pn2: P2 };

  type P3 = { p3: string };
  type P3Namespaced = { pn3: P3 };

  type D1 = { d1: string };
  type D1Namespaced = { dn1: D1 };

  type D2 = { d2: string };
  type D2Namespaced = { dn2: D2 };

  type D3 = { d3: string };
  type D3Namespaced = { dn3: D3 };

  describe(`composition`, () => {
    it(`returns correct types for single composition`, async () => {
      type Provide1 = { p1: string };
      type Dep1 = { d1: string };

      const dep1T = trait<Dep1>().define('dNamespace1', ctx => ({ d1: 'sdf' }));
      const provide1T = trait<P1>().define('pNamespace1', [dep1T], () => {
        return { p1: ' sdf' };
      });

      type Provide2 = { p2: string };
      type Dep2 = { d2: string };

      const dep2T = trait<Dep2>().define('dNamespace2', ctx => ({ d2: '' }));
      const provide2T = trait<P2>().define('pNamespace2', [dep2T], () => {
        return { p2: ' sdf' };
      });

      const composed = Trait.compose(provide1T, provide2T);
      const result = composed.get({ dNamespace1: { d1: 'd1' }, dNamespace2: { d2: 'd2' } });

      expectType<
        TypeEqual<typeof result, { dNamespace1: Dep1; dNamespace2: Dep2; pNamespace1: Provide1; pNamespace2: Provide2 }>
      >(true);
    });

    it(`does not require dependency if it is provided by some previous trait`, async () => {
      const dep1 = trait<D1>().define('dn1', ctx => ({ d1: 'sdf' }));
      const dep2 = trait<D2>().define('dn2', ctx => ({ d2: 'sdf' }));

      const provide1T = trait<P1>().define('pn1', [dep1], ctx => {
        return { p1: ' sdf' };
      });

      const provide2T = trait<P2>().define('pn2', [provide1T, dep2], () => {
        return { p2: ' sdf' };
      });

      const composed = Trait.compose(provide1T, provide2T);

      const result = composed.get({ dn1: { d1: 'd1' }, dn2: { d2: 'd2' } });

      expectType<TypeEqual<typeof result, D1Namespaced & D2Namespaced & P1Namespaced & P2Namespaced>>(true);
    });
  });

  describe(`run`, () => {
    it(`runs trait factory function with given value`, async () => {
      const d1L = trait<D1>().define('dn1', ctx => ({ d1: '' }));
      const p1Context = { pn1: { p1: 'p1' } };
      const d1Context = { dn1: { d1: 'd1' } };

      const factoryF = jest.fn().mockReturnValue(p1Context.pn1);
      const t1 = trait<P1>().define('pn1', [d1L], factoryF);

      const result = t1.get(d1Context);

      expect(result).toEqual({ ...d1Context, ...p1Context });
      expect(factoryF).toHaveBeenCalledWith(d1Context);
    });

    it(`allows to replace own return value`, async () => {
      const d1L = trait<D1>().define('dn1', ctx => ({ d1: '' }));

      const p1Context = { pn1: { p1: 'p1' } };
      const p1ContextReplaced = { pn1: { p1: 'replaced' } };
      const d1Context = { dn1: { d1: 'd1' } };

      const factoryF = jest.fn().mockReturnValue(p1Context.pn1);
      const t1 = trait<P1>().define('pn1', [d1L], factoryF);

      const result = t1.getReplace([t1.provide(p1ContextReplaced.pn1)], d1Context);

      expect(result).toEqual({ ...d1Context, ...p1ContextReplaced });
      expect(factoryF).not.toHaveBeenCalled();
    });
  });
});
