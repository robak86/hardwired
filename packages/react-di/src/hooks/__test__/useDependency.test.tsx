import { container, module, unit, value } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../testing/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useDependency } from '../useDependency';

describe(`useDependency`, () => {
  const m1 = module('myModule')
    .define('val1', value('val1'))
    .define('val2', value('val2'));

  function setup() {
    const Consumer = () => {
      const val1 = useDependency(m1, 'val1');
      return <DummyComponent value={val1} />;
    };

    const c = container(unit('empty'));

    return render(
      <ContainerProvider container={c}>
        <Consumer />
      </ContainerProvider>,
    );
  }

  describe(`instantiating dependencies`, () => {
    it(`gets dependency from the module`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });
  });
});
