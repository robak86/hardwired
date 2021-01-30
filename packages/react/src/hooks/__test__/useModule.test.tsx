import { container, module, request, value } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useModule } from '../useModule';

describe(`useModule`, () => {
  describe(`instantiating dependencies`, () => {
    const m1 = module('myModule').define('val1', value('val1')).define('val2', value('val2'));

    function setup() {
      const Consumer = () => {
        const { val1 } = useModule(m1);
        return <DummyComponent value={val1} />;
      };

      const c = container();

      return render(
        <ContainerProvider container={c}>
          <Consumer />
        </ContainerProvider>,
      );
    }

    it(`gets dependency from the module`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });
  });

  describe(`binding transient dependencies to component instance`, () => {
    class TestClass {
      public id = Math.random();

      constructor() {}
    }

    const m1 = module('myModule').define('cls', request(TestClass));

    function setup() {
      const Consumer = () => {
        const { cls } = useModule(m1);
        return <DummyComponent value={cls.id.toString()} />;
      };

      const c = container();

      const TestSubject = () => {
        return (
          <ContainerProvider container={c}>
            <div data-testid={'consumer1'}>
              <Consumer />
            </div>
            <div data-testid={'consumer2'}>
              <Consumer />
            </div>
          </ContainerProvider>
        );
      };

      return { TestSubject };
    }

    it(`reuses the same transient instance for component rerender`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject />);

      const render1Consumer1Value = result.getByTestId('consumer1').textContent;
      const render1Consumer2Value = result.getByTestId('consumer2').textContent;

      expect(render1Consumer1Value).not.toEqual(render1Consumer2Value);

      result.rerender(<TestSubject />);

      const render2Consumer1Value = result.getByTestId('consumer1').textContent;
      const render2Consumer2Value = result.getByTestId('consumer2').textContent;

      expect(render2Consumer1Value).not.toEqual(render2Consumer2Value);
      expect(render1Consumer1Value).toEqual(render2Consumer1Value);
      expect(render1Consumer2Value).toEqual(render2Consumer2Value);
    });
  });
});
