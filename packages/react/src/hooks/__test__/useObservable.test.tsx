import { container, singleton } from 'hardwired';
import { act, render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useObservable } from '../useObservable';
import { DummyObservable } from '../../__test__/DummyObservable';

describe(`useObservable`, () => {
  describe(`instantiating dependencies`, () => {
    const val1Def = singleton.fn(() => new DummyObservable('val1'));

    function setup() {
      const Consumer = () => {
        const val1 = useObservable(val1Def, v => v.someValue);
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
    const clsDef = singleton.fn(() => new DummyObservable(Math.random()));

    function setup() {
      const Consumer = () => {
        const value = useObservable(clsDef, v => v.someValue);
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

      const observableDef = singleton.fn(() => observable);

      const TestSubject = () => {
        const state = useObservable(observableDef);
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
        callback(this);
        return cancelFnSpy;
      }

      const observableDef = singleton.fn(() => observable);

      const TestSubject = () => {
        const { someValue } = useObservable(observableDef);
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
      const observableDef = singleton.fn(() => observable);

      const TestSubject = () => {
        const state = useObservable(observableDef, obj => obj.someValue);
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
