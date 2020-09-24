import { container, module, moduleImport, value } from "hardwired";
import { store } from "../StoreResolver";
import { selector } from "../SelectorResolver";
import { component, Component, ContainerProvider } from "hardwired-react";
import { render } from "@testing-library/react";
import React, { FunctionComponent } from "react";
import { dispatch } from "../DispatchResolver";
import { reducer } from "../ReducerResolver";

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
      const selectStateValue = state => state.value;
      const updateAction = (newValue: string) => ({ type: 'update', newValue });
      const updateReducer = state => ({ value: 'updated' });

      const m = module('someModule')
        .define('initialState', _ => value({ value: 'initialValue' }))
        .define('store', _ => store(_.initialState))
        .define('rootReducer', _ => reducer(updateReducer))
        .define('someSelector', _ => selector(selectStateValue))
        .define('updateValue', _ => dispatch(updateAction))
        .define('DummyComponentContainer', _ =>
          component(DummyComponent, {
            value: _.someSelector,
            onUpdateClick: _.updateValue,
          }),
        );

      return render(
        <ContainerProvider>
          <Component module={m} name={'DummyComponentContainer'} />
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
        .define('updateValue', _ => dispatch(updateAction))
        .define('DummyComponentContainer', _ =>
          component(DummyComponent, {
            value: _.selectors.someSelector,
            onUpdateClick: _.updateValue,
          }),
        );

      // const c = container(m)
      // c.get(m, 'DummyComponentContainer')
      //
      // console.log(m)

      return render(
        <ContainerProvider>
          <Component module={m} name={'DummyComponentContainer'} />
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
