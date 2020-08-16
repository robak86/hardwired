import { module, value } from 'hardwired';
import { createContainer } from '../createContainer';
import { render } from '@testing-library/react';
import { DummyComponent } from '../DummyComponent';
import * as React from 'react';

describe(`createContainer`, () => {
  const m1 = module('myModule')
    .define('val1', _ => value('val1'))
    .define('val2', _ => value('val2'));

  const { Container, useDependency, useContainer } = createContainer(m1);

  describe(`useDependency`, () => {
    function setup() {
      const Consumer = () => {
        const val1 = useDependency(m1, 'val1');
        return <DummyComponent value={val1} />;
      };

      return render(
        <Container context={{}}>
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

  describe(`useContainer`, () => {
    function setup() {
      const Consumer = () => {
        const { val1 } = useContainer();

        return <DummyComponent value={val1} />;
      };

      return render(
        <Container context={{}}>
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
});
