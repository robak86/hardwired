import { singleton } from '../../strategies/SingletonStrategy';
import { module } from '../ModuleBuilder';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { container } from '../../container/Container';

describe(`literal`, () => {
  it(`works`, async () => {
    const m = module()
      .literal('someNumber', _ => 1, singleton)
      .literal('someString', _ => 'someString', singleton)
      .literal('cls', ctx => new TestClassArgs2(ctx.someNumber, ctx.someString), singleton)
      .freeze();

    const c = container();
    const { someNumber, someString, cls } = c.asObject(m);
    expect(cls.someString).toEqual('someString');
    expect(cls.someNumber).toEqual(1);
  });
});
