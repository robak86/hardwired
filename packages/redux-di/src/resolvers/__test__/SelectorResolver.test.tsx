import { container, module, moduleImport, unit, value } from 'hardwired';
import { store } from '../StoreResolver';
import { selector } from '../SelectorResolver';
import { ContainerProvider, useWatchable } from 'hardwired-react';
import { render } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { dispatch } from '../DispatchResolver';
import { reducer } from '../ReducerResolver';

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

describe(`SelectorResolver`, () => {
  describe(`flat module`, () => {
    function setup() {
      const selectStateValue = (state): string => state.value;
      const updateAction = (newValue: string) => ({ type: 'update', newValue });
      const updateReducer = state => ({ value: 'updated' });

      const m = module('someModule')
        .define('initialState', _ => value({ value: 'initialValue' }))
        .define('store', _ => store(_.initialState))
        .define('rootReducer', _ => reducer(updateReducer))
        .define('someSelector', _ => selector(selectStateValue))
        .define('updateValue', _ => dispatch(updateAction));

      const Container = () => {
        const value = useWatchable(m, 'someSelector');
        const onUpdate = useWatchable(m, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container(unit('empty'));

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
      const selectStateValue = state => state.value;
      const updateAction = (newValue: string) => ({ type: 'update', newValue });
      const updateReducer = state => ({ value: 'updated' });

      const selectorsModule = module('selectors').define('someSelector', _ => selector(selectStateValue));

      const m = module('someModule')
        .define('selectors', _ => moduleImport(selectorsModule))
        .define('initialState', _ => value({ value: 'initialValue' }))
        .define('store', _ => store(_.initialState))
        .define('rootReducer', _ => reducer(updateReducer))
        .define('updateValue', _ => dispatch(updateAction));

      const Container = () => {
        const value = useWatchable(selectorsModule, 'someSelector');
        const onUpdate = useWatchable(m, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container(unit('empty'));
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
