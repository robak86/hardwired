import { unbound } from '../unbound.js';

describe(`unbound`, () => {
  it(`uses name as an id`, async () => {
    const someDefinition = unbound('someName', { metaKey: 123 });
    expect(someDefinition.id).toEqual('someName');
    expect(someDefinition.meta).toEqual({ metaKey: 123 });
  });
});
