import { container, literal, module } from 'hardwired';
import { act, render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useObservable } from '../useObservable';
import { DummyObservable } from '../../__test__/DummyObservable';

describe(`useObservable`, () => {
  describe(`instantiating dependencies`, () => {
    const m1 = module() //breakme
      .define(
        'val1',
        literal(() => new DummyObservable('val1')),
      )
      .define(
        'val2',
        literal(() => new DummyObservable('val2')),
      );

    function setup() {
      const Consumer = () => {
        const val1 = useObservable(m1, 'val1', v => v.someValue);
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
    const m1 = module().define(
      'cls',
      literal(() => new DummyObservable(Math.random())),
    );

    function setup() {
      const Consumer = () => {
        const value = useObservable(m1, 'cls', v => v.someValue);
        return <DummyComponent value={value} />;
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
      jest.spyOn(observable, 'subscribe');

      const m = module().define(
        'observable',
        literal(() => observable),
      );

      const TestSubject = () => {
        const state = useObservable(m, 'observable');
        return <>{state.someValue}</>;
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
      result.unmount();
    });

    it(`clears subscription on unmount`, async () => {
      const observable = new DummyObservable(1);
      const cancelFnSpy = jest.fn();
      jest.spyOn(observable, 'subscribe').mockImplementation(subscribeMock);

      function subscribeMock(this: DummyObservable<any>, callback) {
        callback(this)
        return cancelFnSpy;
      }

      const m = module().define(
        'observable',
        literal(() => observable),
      );

      const TestSubject = () => {
        const {someValue} = useObservable(m, 'observable');
        return <>{someValue}</>;
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

      const m = module().define(
        'observable',
        literal(() => observable),
      );

      const TestSubject = () => {
        const state = useObservable(m, 'observable', obj => obj.someValue);
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
