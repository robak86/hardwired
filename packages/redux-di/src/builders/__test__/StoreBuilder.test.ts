import { StoreBuilder, storeDefines } from '../StoreBuilder';
import { container, module } from '@hardwired/di';
import { StoreInstance } from '../../StoreInstance';

describe(`StoreBuilder`, () => {
  it(`sdf`, async () => {
    type AppState = {
      a: number;
    };
    const m = module('someName')

      .using(storeDefines<AppState>())
      .define('store', () => ({ a: 1 }));
    //.using(reducerDefines(c => c.store   ))

    const c = container(m);
    expect(c.get('store')).toBeInstanceOf(StoreInstance);
  });
});
