import { module, value } from "hardwired";
import { component } from "hardwired-react";
import React, { FunctionComponent } from "react";
import { dispatch, reducer, selector, store } from "./state/reduxResolvers";
import { AppState } from "./state/AppState";
import { rootReducer } from "./state/rootReducer";

const selectStateValue = state => state.value;
const updateAction = (newValue: string) => ({ type: 'update', newValue });
const updateReducer = (state: AppState) => {
  return {
    ...state,
  };
};

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

export const appModule = module('app')
  .define('initialState', value({ value: 'initialValue' }))
  .define('store', _ => store(_.initialState))
  .define('rootReducer', _ => reducer(rootReducer))
  .define('someSelector', _ => selector(selectStateValue))
  .define('updateValue', _ => dispatch(updateAction))
  .define('DummyComponentContainer', _ =>
    component(DummyComponent, {
      value: _.someSelector,
      onUpdateClick: _.updateValue,
    }),
  );
