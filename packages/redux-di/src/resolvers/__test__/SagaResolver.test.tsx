import { saga } from '../SagaResolver';
import { container, module, value } from 'hardwired';
import { store } from '../StoreResolver';

describe(`SagaResolver`, () => {
  function setup() {
    function* someSaga() {}

    const m = module('someModule')
      .define('someSaga', _ => saga(someSaga))
      .define('defaultState', _ => value({ v: 'someDefaultValue' }))
      .define('store', _ => store(_.defaultState));
    const c = container(m);

    return { c };
  }

  it(`registers`, async () => {});
});
