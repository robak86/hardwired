import { container, module } from '@hardwired/di-core';
import { AlterableStore } from '../../stack/AlterableStore';
import { reduxDefines } from '../ReduxDefines';
import { ReducerFactory } from '../../factories/ReducerFactory';
import { SagaFactory } from '../../factories/SagaFactory';

describe(`ReduxDefines`, () => {
  it(`sdf`, async () => {
    type AppState = {
      a: number;
    };
    const m = module('someName')
      .using(reduxDefines<AppState>())
      .store('store', () => ({ a: 1 }));

    const c = container(m);
    expect(c.get('store')).toBeInstanceOf(AlterableStore);
  });

  describe(`.reducer`, () => {
    it(`register correct factory`, async () => {
      const a = module('a')
        .using(reduxDefines())
        .reducer('someReducer', () => null);

      expect(a.registry.declarations.get('someReducer')).toBeInstanceOf(ReducerFactory);
    });
  });


  describe(`.saga`, () => {
    it(`register correct factory`, async () => {
      const a = module('a')
        .using(reduxDefines())
        .saga('someSaga', function* saga() {});

      expect(a.registry.declarations.get('someSaga')).toBeInstanceOf(SagaFactory);
    });
  });
});
