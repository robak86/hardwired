import { saga } from '../SagaResolver';
import { container, module, value } from 'hardwired';
import { store } from '../StoreResolver';

describe(`SagaResolver`, () => {
  function setup() {
    function* someSaga() {}

    const m = module('someModule')
      .define('someSaga', saga(someSaga))
      .define('defaultState', value({ v: 'someDefaultValue' }))
      .define('store', store(), ['defaultState']);
    const c = container(m);

    return { c };
  }

  it.todo(`registers`);
});
