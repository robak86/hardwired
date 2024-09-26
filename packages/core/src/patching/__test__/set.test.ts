import { unbound } from '../../definitions/sync/unbound.js';

describe(`set`, () => {
  it(`preserves meta`, async () => {
    const someunbound = unbound<number>('someunbound', { some: 'meta' });

    const overridden = someunbound.bindValue(1);
    expect(overridden.meta).toEqual({ some: 'meta' });
  });
});
