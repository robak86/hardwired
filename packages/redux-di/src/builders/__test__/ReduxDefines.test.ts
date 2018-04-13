import { container, module, value } from '@hardwired/core';
import { AlterableStore } from '../../stack/AlterableStore';
import { reducer, ReducerResolver } from '../../factories/ReducerResolver';
import { saga, SagaResolver } from '../../factories/SagaResolver';
import { store } from '../../factories/StoreResolver';

describe(`ReduxDefines`, () => {
  it(`sdf`, async () => {
    type AppState = {
      a: number;
    };
    const m = module('someName')
      .define('defaultState', _ => value({ a: 1 }))
      .define('store', _ => store(_.defaultState));

    const c = container(m);
    expect(c.get('store')).toBeInstanceOf(AlterableStore);
  });

  describe(`.reducer`, () => {
    it(`register correct factory`, async () => {
      const a = module('a').define('someReducer', _ => reducer(() => null));

      // TODO: hack :/
      expect(a.registry.get('someReducer')({})).toBeInstanceOf(ReducerResolver);
    });
  });

  describe(`.saga`, () => {
    it(`register correct factory`, async () => {
      const a = module('a').define('someSaga', _ => saga(function* saga() {}));

      // TODO: hack :/
      expect(a.registry.get('someSaga')({})).toBeInstanceOf(SagaResolver);
    });
  });
});
