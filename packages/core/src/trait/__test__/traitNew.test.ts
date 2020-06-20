import { Trait } from '../trait';
import { expectType, TypeEqual } from 'ts-expect';
import { trait } from '../traitNew';

describe(`traitNew`, () => {
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

  describe(`construction`, () => {
    it(`creates correct types for trait without any dependencies`, async () => {
      type T1 = { t1: string };
      const a = trait<T1>().define('namespace1', ctx => {
        return { t1: 't1' };
      });

      const result = a.get({});

      expectType<TypeEqual<typeof result, { namespace1: T1 }>>(true);
      expectType<TypeEqual<typeof result, { namespace1: T1 }>>(true);
    });

    it(`creates correct types for trait with a single dependency`, async () => {
      const d1 = trait<D1>().define('dn1', ctx => ({ d1: '' }));
      const a = trait<P1>().define('pn1', [d1], ctx => {
        expectType<TypeEqual<typeof ctx, D1Namespaced>>(true);
        return { t1: 't1' } as any;
      });

      const result = a.get({ dn1: { d1: 'sdf' } });

      expectType<TypeEqual<typeof result, P1Namespaced & D1Namespaced>>(true);
      expectType<TypeEqual<typeof result, P1Namespaced & D1Namespaced>>(true);
    });

    it(`creates correct types for trait with a two dependencies`, async () => {
      const dependency1L = trait<D1>().define('dn1', ctx => ({ d1: '' }));
      const dependency2L = trait<D2>().define('dn2', ctx => ({ d2: '' }));

      const a = trait<P1>().define('pn1', [dependency1L, dependency2L], ctx => {
        expectType<TypeEqual<typeof ctx, D1Namespaced & D2Namespaced>>(true);

        return { p1: 'df' };
      });

      const result = a.get({ dn1: { d1: 'sdf' }, dn2: { d2: '234' } });

      expectType<TypeEqual<typeof result, P1Namespaced & D1Namespaced & D2Namespaced>>(true);
    });

    it(`creates correct types for trait with tree dependencies`, async () => {
      const dependency1L = trait<D1>().define('dn1', ctx => ({ d1: '1' }));
      const dependency2L = trait<D2>().define('dn2', ctx => ({ d2: '2' }));
      const dependency3L = trait<D3>().define('dn3', ctx => ({ d3: '3' }));

      const a = trait<P1>().define('pn1', [dependency1L, dependency2L, dependency3L], ctx => {
        expectType<TypeEqual<typeof ctx, D1Namespaced & D2Namespaced & D3Namespaced>>(true);

        return { p1: 't1' };
      });

      const result = a.get({ dn1: { d1: 'd1' }, dn2: { d2: 'd2' }, dn3: { d3: 'd3' } });
      expectType<TypeEqual<typeof result, P1Namespaced & D1Namespaced & D2Namespaced & D3Namespaced>>(true);
    });
  });
});
