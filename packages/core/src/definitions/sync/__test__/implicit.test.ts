import { implicit } from '../implicit.js';

describe(`implicit`, () => {
  it(`uses name as an id`, async () => {
    const someDefinition = implicit('someName', { metaKey: 123 });
    expect(someDefinition.id).toEqual('someName');
    expect(someDefinition.meta).toEqual({ metaKey: 123 });
  });
});
