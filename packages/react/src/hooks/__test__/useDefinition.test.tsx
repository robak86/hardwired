import { container, literal, module, request, value } from 'hardwired';
import { act, render } from '@testing-library/react';
import { DummyComponent } from '../../testing/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useDefinition } from '../useDefinition';
import { DummyObservable } from '../../testing/DummyObservable';

describe(`useDefinition`, () => {
  describe(`instantiating dependencies`, () => {
    const m1 = module('myModule').define('val1', value('val1')).define('val2', value('val2'));

    function setup() {
      const Consumer = () => {
        const val1 = useDefinition(m1, 'val1');
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
        const cls = useDefinition(m1, 'cls');
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

    it.skip(`reuses the same transient instance for component rerender`, async () => {
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

  describe(`observability`, () => {
    it(`calls subscribe and unmount`, async () => {
      const observable = new DummyObservable(1);
      const cancelFnSpy = jest.fn();
      jest.spyOn(observable, 'subscribe').mockReturnValue(cancelFnSpy);

      const m = module('example').define(
        'observable',
        literal(() => observable),
      );

      const TestSubject = () => {
        const { state } = useDefinition(m, 'observable');
        return <>{state}</>;
      };

      const Container = ({ dummyProperty }) => {
        return (
          <ContainerProvider>
            <>{dummyProperty}</>
            <TestSubject />
          </ContainerProvider>
        );
      };

      const result = render(<Container dummyProperty={1} />);
      result.rerender(<Container dummyProperty={2} />);

      expect(observable.subscribe).toHaveBeenCalledTimes(1);
      expect(cancelFnSpy).not.toHaveBeenCalled();
      result.unmount();
      expect(cancelFnSpy).toHaveBeenCalled();
    });

    it(`re-renders view`, async () => {
      const observable = new DummyObservable(1);

      const m = module('example').define(
        'observable',
        literal(() => observable),
      );

      const TestSubject = () => {
        const { state } = useDefinition(m, 'observable');
        return <div data-testid={'value'}>{state}</div>;
      };

      const Container = () => {
        return (
          <ContainerProvider>
            <TestSubject />
          </ContainerProvider>
        );
      };

      const result = render(<Container />);
      expect(result.getByTestId('value').textContent).toEqual('1');

      act(() => {
        observable.setValue(2);
      });

      expect(result.getByTestId('value').textContent).toEqual('2');
    });
  });
});
