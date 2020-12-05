import { container, module, value } from 'hardwired';
import { AlterableStore } from '../../stack/AlterableStore';
import { reducer, ReducerResolver } from '../../resolvers/ReducerResolver';
import { saga, SagaResolver } from '../../resolvers/SagaResolver';
import { store } from '../../resolvers/StoreResolver';

describe(`ReduxDefines`, () => {
  it(`sdf`, async () => {
    type AppState = {
      a: number;
    };
    const m = module('someName')
      .define('defaultState', value({ a: 1 }))
      .define('store', store(), ['defaultState']);

    const c = container(m);
    expect(c.get('store')).toBeInstanceOf(AlterableStore);
  });

  describe(`.reducer`, () => {
    it.todo(`register correct factory`, async () => {
      const a = module('a').define(
        'someReducer',
        reducer(() => null),
      );

      // TODO: hack :/
      // expect(a.registry.get('someReducer')({})).toBeInstanceOf(ReducerResolver);
    });
  });

  describe(`.saga`, () => {
    it.todo(`register correct factory`, async () => {
      const a = module('a').define(
        'someSaga',
        saga(function* saga() {}),
      );

      // TODO: hack :/
      // expect(a.registry.get('someSaga')({})).toBeInstanceOf(SagaResolver);
    });
  });
});
