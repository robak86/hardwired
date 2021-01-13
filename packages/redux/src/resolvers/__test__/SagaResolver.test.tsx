import { saga } from '../SagaResolver';
import { container, factory, module, value } from 'hardwired';
import { StoreFactory } from '../../tests/StoreFactory';
import { storeFactory } from '../StoreFactory';

describe(`SagaResolver`, () => {
  function setup() {
    function* someSaga() {}

    const m = module('someModule')
      .define('someSaga', saga(someSaga))
      .define('defaultState', value({ value: 'someDefaultValue' }))
      .define(
        'reducer',
        value(s => s),
      )
      .define('store', storeFactory(StoreFactory), ['reducer', 'defaultState']);
    const c = container();

    return { c };
  }

  it.todo(`registers`);
});
