import { module, value } from 'hardwired';

import { component } from 'hardwired-react';
import { dispatch, reducer, selector, store } from 'hardwired-redux';
import React from 'react';
import { FunctionComponent } from 'react';

const selectStateValue = state => state.value;
const updateAction = (newValue: string) => ({ type: 'update', newValue });
const updateReducer = state => ({ value: 'updated' });

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
