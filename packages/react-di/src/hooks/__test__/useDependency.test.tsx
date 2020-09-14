import { module, value } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../testing/DummyComponent';
import * as React from 'react';
import { Container } from '../../components/Container';
import { useDependency } from '../useDependency';

describe(`useDependency`, () => {
  const m1 = module('myModule')
    .define('val1', _ => value('val1'))
    .define('val2', _ => value('val2'));

  function setup() {
    const Consumer = () => {
      const val1 = useDependency(m1, 'val1');
      return <DummyComponent value={val1} />;
    };

    return render(
      <Container>
        <Consumer />
      </Container>,
    );
  }

  describe(`instantiating dependencies`, () => {
    it(`gets dependency from the module`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });
  });
});
