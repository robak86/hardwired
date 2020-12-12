import { module } from "hardwired";
import React, { FunctionComponent } from "react";

import { AppState } from "./state/AppState";
import { selector } from "hardwired-redux/lib/resolvers/SelectorResolver";
import { dispatch } from "hardwired-redux/lib/resolvers/DispatchResolver";
import { storeModule } from "./state/store.module";

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
  .define('store', storeModule)
  .define('someSelector', selector(selectStateValue, 0),  ['store.store'])
  .define('updateValue', dispatch(updateAction), ['store.store']);
