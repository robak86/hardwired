import { container, factory, module, value } from 'hardwired';
import { ContainerProvider, useWatchable } from 'hardwired-react';
import { render } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { selector } from '../SelectorResolver';
import { dispatch } from '../DispatchResolver';
import { StoreFactory } from '../../tests/StoreFactory';

export type DummyComponentProps = {
  value: string;
  onUpdateClick: (newValue) => void;
};

export const DummyComponent: FunctionComponent<DummyComponentProps> = ({ value, onUpdateClick }) => {
  const onUpdateClb = () => onUpdateClick('updated');
  return (
    <>
      <div data-testid="value">{value}</div>
      <button onClick={onUpdateClb}>update</button>
    </>
  );
};

const selectStateValue = state => state.value;
const toUpperCase = (s: string) => s.toUpperCase();
const updateAction = (newValue: string) => ({ type: 'update', newValue });
const updateReducer = (state, action) => {
  if (action.type === 'update') {
    return { value: 'updated' };
  }
  return state;
};

describe(`SelectorResolver`, () => {
  describe(`flat module`, () => {
    function setup() {
      const m = module('someModule')
        .define('initialState', value({ value: 'initialValue' }))
        .define('rootReducer', value(updateReducer))
        .define('store', factory(StoreFactory), ['rootReducer', 'initialState'])

        .define('someSelector', selector(selectStateValue), ['store'])
        .define('updateValue', dispatch(updateAction), ['store']);

      const Container = () => {
        const value = useWatchable(m, 'someSelector');
        const onUpdate = useWatchable(m, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container();
      c.load(m);

      return render(
        <ContainerProvider container={c}>
          <Container />
        </ContainerProvider>,
      );
    }

    it(`correctly select initial state value`, async () => {
      const result = setup();
      expect(result.getByTestId('value').textContent).toEqual('initialValue');
    });

    it(`rerender component on store change`, async () => {
      const result = setup();
      expect(result.getByTestId('value').textContent).toEqual('initialValue');
      const button = await result.findByRole('button');
      button.click();
      expect(result.getByTestId('value').textContent).toEqual('updated');
    });
  });

  describe(`external modules`, () => {
    function setup() {
      const selectorsModule = module('selectors')
        .define('redux', () => m)
        .define('someSelector', selector(selectStateValue), ['redux.store'])
        .define('composedSelector', selector(toUpperCase), ['someSelector']);

      const m = module('reduxModule')
        .define('initialState', value({ value: 'initialValue' }))
        .define('rootReducer', value(updateReducer))
        .define('store', factory(StoreFactory), ['rootReducer', 'initialState'])
        .define('updateValue', dispatch(updateAction), ['store']);

      const Container = () => {
        const value = useWatchable(selectorsModule, 'someSelector');
        const onUpdate = useWatchable(m, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container();
      c.load(m);

      return render(
        <ContainerProvider container={c}>
          <Container />
        </ContainerProvider>,
      );
    }

    it(`correctly select initial state value`, async () => {
      const result = setup();
      expect(result.getByTestId('value').textContent).toEqual('initialValue');
    });

    it(`rerender component on store change`, async () => {
      const result = setup();
      expect(result.getByTestId('value').textContent).toEqual('initialValue');
      const button = await result.findByRole('button');
      button.click();
      expect(result.getByTestId('value').textContent).toEqual('updated');
    });
  });
});
