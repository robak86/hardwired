import { singleton } from '../../strategies/SingletonStrategy';
import { module } from '../ModuleBuilder';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { container } from '../../container/Container';

describe(`literal`, () => {
  it(`works`, async () => {
    const m = module()
      .literal('v1', _ => 1, singleton)
      .literal('v2', _ => 'someString', singleton)
      .literal('cls', ctx => new TestClassArgs2(ctx.v1, ctx.v2), singleton)
      .freeze();

    const c = container();
    const { v1, v2, cls } = c.asObject(m);
    expect(cls.someString).toEqual('someString')
    expect(cls.someNumber).toEqual(1)
  });
});
