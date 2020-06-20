import { Trait } from '../trait';
import { expectType, TypeEqual } from 'ts-expect';
import { trait } from '../traitNew';

describe(`traitModule`, () => {
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

  function setup() {
    const p1Context: P1Namespaced = { pn1: { p1: 'p1' } };
    const p1FactorySpy = jest.fn().mockReturnValue(p1Context.pn1);
    const p1L = trait<P1>().define('pn1', p1FactorySpy);

    const p2Context: P2Namespaced = { pn2: { p2: 'p2' } };
    const p2FactorySpy = jest.fn().mockReturnValue(p2Context.pn2);
    const p2L = trait<P2>().define('pn2', p2FactorySpy);

    const p3Context: P3Namespaced = { pn3: { p3: 'p3' } };
    const p3FactorySpy = jest.fn().mockReturnValue(p3Context.pn3);
    const p3L = trait<P3>().define('pn3', p3FactorySpy);

    const d1Context: D1Namespaced = { dn1: { d1: 'd1' } };
    const d1L = trait<D1>().define('dn1', () => ({ d1: '' }));

    const d2Context: D2Namespaced = { dn2: { d2: 'd2' } };
    const d2L = trait<D2>().define('dn2', () => ({ d2: '' }));

    const d3Context: D3Namespaced = { dn3: { d3: 'd3' } };
    const d3L = trait<D2>().define('dn3', () => ({ d2: '' }));

    return {
      p1L,
      p1Context,
      p2L,
      p2Context,
      p3L,
      p3Context,
      d1L,
      d1Context,
      d2L,
      d2Context,
      d3L,
      d3Context,
      p1FactorySpy,
      p2FactorySpy,
      p3FactorySpy,
    };
  }

  it(`generates Reader with correct generic types when second trait has dependencies not provided by first trait`, async () => {
    const { d1L, p1L, p2L, p1FactorySpy, p2FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);
    const module = Trait.compose(p1Trait, p2Trait);

    expectType<TypeEqual<typeof module, Trait<D1Namespaced, D1Namespaced & P1Namespaced & P2Namespaced, never>>>(true);
  });

  it(`generates Reader with correct generic types when second trait gets all dependencies from first trait`, async () => {
    const { p1L, p2L, p1FactorySpy, p2FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [p1L], p2FactorySpy);
    const module = Trait.compose(p1Trait, p2Trait);

    expectType<TypeEqual<typeof module, Trait<{}, P1Namespaced & P2Namespaced, never>>>(true);
  });

  it(`generates Reader with correct generic types when both traits have theirs dependencies not provided`, async () => {
    const { p1L, p2L, d1L, d2L, p1FactorySpy, p2FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', [d2L], p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);
    const module = Trait.compose(p1Trait, p2Trait);

    expectType<
      TypeEqual<
        typeof module,
        Trait<D1Namespaced & D2Namespaced, D1Namespaced & D2Namespaced & P1Namespaced & P2Namespaced, never>
      >
    >(true);
  });

  it(`creates linked list from given traits`, async () => {
    const { p1FactorySpy, p2FactorySpy, p3L, p3FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', p2FactorySpy);
    const p3Trait = trait<P3>().define('pn3', p3FactorySpy);

    const composed: any = Trait.compose(p1Trait, p2Trait, p3Trait);

    expect(composed.id).toEqual(p3Trait.id);
    expect(composed.prev?.id).toEqual(p2Trait.id);
    expect(composed.prev?.prev?.id).toEqual(p1Trait.id);
  });

  it(`builds output of different traits`, async () => {
    const { d1L, d1Context, p1L, p1Context, p2L, p2Context, p1FactorySpy, p2FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);

    // console.log(p1Trait.get({}));
    // console.log(p2Trait.get({ dn1: { d1: '1' } }));
    const module = Trait.compose(p1Trait, p2Trait);
    const result = module.getReplace([], d1Context);

    expect(p1FactorySpy).toHaveBeenCalledTimes(1);
    expect(p2FactorySpy).toHaveBeenCalledTimes(1);

    // console.log(module.get({ dn1: { d1: '1' } }));

    expect(result).toEqual({ ...d1Context, ...p1Context, ...p2Context });
  });

  it(`calls next trait with the output of the previous`, async () => {
    const { d1L, d1Context, p1L, p1Context, p2L, p2Context, p1FactorySpy, p2FactorySpy } = setup();

    const d1Trait = trait<D1>().define('dn1', ctx => ({ d1: '' }));
    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1Trait], p2FactorySpy);

    p2Trait.get({ dn1: { d1: 'sdf' } });

    const module = Trait.compose(p1Trait, p2Trait);
    module.get(d1Context);

    expect(p1FactorySpy).toHaveBeenCalledWith(d1Context);
    expect(p2FactorySpy).toHaveBeenCalledWith({ ...p1Context, ...d1Context });
  });

  it(`replaces traits with provided values`, async () => {
    const { d1L, d1Context, p1L, p2L, p2Context, p2FactorySpy, p1FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);
    const module = Trait.compose(p1Trait, p2Trait);

    const result = module.getReplace([p1L.provide({ p1: 'replaced' })], d1Context);

    expect(result).toEqual({ ...d1Context, pn1: { p1: 'replaced' }, ...p2Context });
  });

  it(`calls next trait with replaced value`, async () => {
    const { d1L, d1Context, p1L, p2L, p2FactorySpy, p1FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);
    const module = Trait.compose(p1Trait, p2Trait);
    module.getReplace([p1L.provide({ p1: 'replaced' })], d1Context);

    expect(p2FactorySpy).toHaveBeenCalledWith({ ...d1Context, pn1: { p1: 'replaced' } });
  });

  it(`overrides trait value with next trait if they provide the same value`, async () => {
    const { d1L, d1Context, p1L, p1Context, p2L, p2FactorySpy, p1FactorySpy, p3FactorySpy } = setup();

    const p1Trait = trait<P1>().define('pn1', p1FactorySpy);
    const p2Trait = trait<P2>().define('pn2', [d1L], p2FactorySpy);
    const p2TraitOverrider = trait<P2>().define('pn2', [d1L], () => ({ p2: 'overridden' }));
    const module = Trait.compose(p1Trait, p2Trait, p2TraitOverrider);

    const result = module.get(d1Context);

    expect(result).toEqual({ ...d1Context, ...p1Context, pn2: { p2: 'overridden' } });
  });
});
