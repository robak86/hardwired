import { AcquiredInstance, container, ContainerContext, Instance, module, unit, value } from 'hardwired';
import { DummyComponent } from '../../testing/DummyComponent';
import { act, render } from '@testing-library/react';
import { ContainerProvider } from '../../components/ContainerProvider';
import * as React from 'react';
import { useWatchable } from '../useWatchable';
import { expectType, TypeEqual } from 'ts-expect';
import { BaseAcquiredInstance } from 'hardwired';

describe(`useWatchable`, () => {
  describe(`using dependencies from root module`, () => {
    function setup() {
      const m1 = module('myModule').define('val1', value('val1'));

      const Container = () => {
        const value = useWatchable(m1, 'val1');
        return <DummyComponent value={value} />;
      };

      const c = container();

      return {
        wrapper: render(
          <ContainerProvider container={c}>
            <Container />
          </ContainerProvider>,
        ),
        container: c,
        m1,
      };
    }

    it(`returns correct type`, async () => {
      const m1 = module('myModule').define('val1', value('val1'));
      const preventHookCall = () => {
        const v = useWatchable(m1, 'val1');
        expectType<TypeEqual<typeof v, string>>(true);
      };
    });

    it(`renders inner component`, async () => {
      const { wrapper } = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });

    it.skip(`cleans listeners on unmount`, async () => {
      const { wrapper, container, m1 } = setup();
      const events = container.__acquireInstanceResolver_experimental(m1, 'val1').getEvents();
      expect(events.invalidateEvents.count).toEqual(1);
      wrapper.unmount();
      expect(events.invalidateEvents.count).toEqual(0);
    });
  });

  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const m1 = module('myModule').define('val1', value('val1'));

      const SomeComponent = () => {
        const val = useWatchable(m1, 'val1');

        expectType<TypeEqual<typeof val, string>>(true);
      };
    });
  });

  describe(`component rerender`, () => {
    class AcquiredResolver extends BaseAcquiredInstance<any> {}

    class ObservableValue<T> extends Instance<T, []> {
      invalidate!: () => void;
      acquiredResolver;

      constructor(private value) {
        super();
      }

      acquire(context: ContainerContext): AcquiredInstance<T> {
        this.acquiredResolver = new AcquiredResolver(this.id, context, this.build);
        this.invalidate = this.acquiredResolver.getEvents().invalidateEvents.emit;
        return this.acquiredResolver;
      }

      build(context: ContainerContext): T {
        return this.value;
      }

      setValue(newValue) {
        this.value = newValue;
        this.invalidate();
      }
    }

    function observable<TDeps extends any[], TValue>(value: TValue): ObservableValue<TValue> {
      return new ObservableValue(value);
    }

    function setup() {
      const observedInstance = observable('initialValue');
      const m1 = unit('test').define('stringProp', observedInstance);

      const c = container();

      const Container = () => {
        const value = useWatchable(m1, 'stringProp');
        return <DummyComponent value={value} />;
      };

      const Component = () => {
        return (
          <ContainerProvider container={c}>
            <Container />
          </ContainerProvider>
        );
      };

      return {
        Component,
        container: c,
        m1,
        observedInstance,
      };
    }

    it.skip(`re-renders component on instance revalidate event`, async () => {
      const { Component, observedInstance } = setup();

      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('initialValue');

      act(() => observedInstance.setValue('updatedValue'));

      expect(result.getByTestId('value').textContent).toEqual('updatedValue');
    });
  });
});
