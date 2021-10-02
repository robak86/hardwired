import { container, singleton } from 'hardwired';
import { useObservable } from '../../hooks/useObservable';
import { DummyComponent } from '../../__test__/DummyComponent';
import { act, render } from '@testing-library/react';
import { ContainerProvider } from '../../components/ContainerProvider';
import * as React from 'react';
import { ComponentState } from '../ComponentState';

describe(`ComponentState`, () => {
  class DummyComponentState extends ComponentState<{ value: number }> {
    state = { value: 0 };

    increment() {
      this.setState(({ value }) => ({ value: value + 1 }));
    }

    reset() {
      this.setState({ value: 0 });
    }
  }

  describe(`instantiating dependencies`, () => {
    const stateDef = singleton.class(DummyComponentState);

    function setup() {
      const Consumer = () => {
        const val1 = useObservable(stateDef, v => v.value);
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
      expect(wrapper.getByTestId('value').textContent).toEqual('0');
    });
  });

  describe(`observability`, () => {
    it(`re-renders view`, async () => {
      const stateDef = singleton.class(DummyComponentState);

      const TestSubject = () => {
        const state = useObservable(stateDef, obj => obj.value);
        return <div data-testid={'value'}>{state}</div>;
      };

      const c = container();

      const Container = () => {
        return (
          <ContainerProvider container={c}>
            <TestSubject />
          </ContainerProvider>
        );
      };

      const componentState = c.get(stateDef);
      const result = render(<Container />);
      expect(result.getByTestId('value').textContent).toEqual('0');

      act(() => {
        componentState.increment();
      });

      expect(result.getByTestId('value').textContent).toEqual('1');

      act(() => {
        componentState.reset();
      });

      expect(result.getByTestId('value').textContent).toEqual('0');
    });
  });
});
