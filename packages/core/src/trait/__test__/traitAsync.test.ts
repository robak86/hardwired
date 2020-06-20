import { expectType, TypeEqual } from 'ts-expect';

import { traitAsync } from '../traitAsync';
import { Trait } from '../trait';

describe(`traitAsync`, () => {
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

  const dependency1L = traitAsync<D1>().define('dn1', async () => ({ d1: '' }));
  const dependency2L = traitAsync<D2>().define('dn2', async () => ({ d2: '' }));
  const dependency3L = traitAsync<D3>().define('dn3', async () => ({ d3: '' }));

  describe(`construction`, () => {
    it(`creates correct types for trait without any dependencies`, async () => {
      const p1T = traitAsync<P1>().define('pn1', async ctx => {
        return { p1: 't1' };
      });

      const result = p1T.get({});

      expectType<TypeEqual<typeof result, Promise<P1Namespaced>>>(true);
    });

    it(`creates correct types for trait with a single dependency`, async () => {
      const a = traitAsync<P1>().define('pn1', [dependency1L], async ctx => {
        return { p1: 't1' };
      });

      const result = a.get({ dn1: { d1: 'sdf' } });

      expectType<TypeEqual<typeof result, Promise<P1Namespaced & D1Namespaced>>>(true);
    });

    it(`creates correct types for trait with a two dependencies`, async () => {
      const a = traitAsync<P1>().define('pn1', [dependency1L, dependency2L], async ctx => {
        return { p1: '' };
      });

      const result = a.get({ dn1: { d1: 'sdf' }, dn2: { d2: '234' } });

      expectType<TypeEqual<typeof result, Promise<P1Namespaced & D1Namespaced & D2Namespaced>>>(true);
    });

    it(`creates correct types for trait with tree dependencies`, async () => {
      const a = traitAsync<P1>().define('pn1', [dependency1L, dependency2L, dependency3L], async ctx => {
        return { p1: 't1' };
      });

      const result = a.get({ dn1: { d1: 'd1' }, dn2: { d2: 'd2' }, dn3: { d3: 'd3' } });
      expectType<TypeEqual<typeof result, Promise<P1Namespaced & D1Namespaced & D2Namespaced & D3Namespaced>>>(true);
    });
  });

  describe(`composition`, () => {
    it(`returns correct types for single composition`, async () => {
      const provide1T = traitAsync<P1>().define('pn1', [dependency1L], async () => {
        return { p1: ' sdf' };
      });

      const provide2T = traitAsync<P2>().define('pn2', [dependency2L], async () => {
        return { p2: ' sdf' };
      });

      const composed = Trait.composeAsync(provide1T, provide2T);

      const result = composed.get({ dn1: { d1: 'd1' }, dn2: { d2: 'd2' } });

      expectType<TypeEqual<typeof result, Promise<P1Namespaced & P2Namespaced & D1Namespaced & D2Namespaced>>>(true);
    });

    it(`does not require dependency if it is provided by some previous trait`, async () => {
      const provide1T = traitAsync<P1>().define('pn1', [dependency1L], async () => {
        return { p1: ' sdf' };
      });

      const provide2T = traitAsync<P2>().define('pn2', [dependency2L, provide1T], async () => {
        return { p2: ' sdf' };
      });

      const composed = Trait.composeAsync(provide1T, provide2T);
      const result = composed.get({ dn1: { d1: 'd1' }, dn2: { d2: 'd2' } });

      expectType<TypeEqual<typeof result, Promise<D1Namespaced & D2Namespaced & P1Namespaced & P2Namespaced>>>(true);
    });
  });
});
