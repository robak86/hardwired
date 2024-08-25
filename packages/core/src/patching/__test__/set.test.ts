import { implicit } from '../../definitions/sync/implicit.js';

describe(`set`, () => {
  it(`preserves meta`, async () => {
    const someImplicit = implicit<number>('someImplicit', { some: 'meta' });

    const overridden = someImplicit.patch().set(1);
    expect(overridden.meta).toEqual({ some: 'meta' });
  });
});
