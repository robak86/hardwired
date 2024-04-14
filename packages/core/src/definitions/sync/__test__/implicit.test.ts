import { implicit, implicitAsync } from '../implicit.js';

describe(`implicit`, () => {
  it(`uses name as an id`, async () => {
    const someDefinition = implicit('someName', { metaKey: 123 });
    expect(someDefinition.id).toEqual('someName');
    expect(someDefinition.meta).toEqual({ metaKey: 123 });
  });
});

describe(`implicitAsync`, () => {
  it(`uses name as an id`, async () => {
    const someDefinition = implicitAsync('someName', { metaKey: 123 });
    expect(someDefinition.id).toEqual('someName');
    expect(someDefinition.meta).toEqual({ metaKey: 123 });
  });
});
