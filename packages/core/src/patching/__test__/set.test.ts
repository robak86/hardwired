import { implicit } from '../../definitions/sync/implicit.js';
import { set } from '../set.js';

describe(`set`, () => {
  it(`preserves meta`, async () => {
    const someImplicit = implicit<number>('someImplicit', { some: 'meta' });

    const overridden = set(someImplicit, 1);
    expect(overridden.meta).toEqual({ some: 'meta' });
  });
});
