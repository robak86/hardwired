import { module, value } from 'hardwired';
import { store } from '../StoreResolver';
import { selector } from '../SelectorResolver';
import { component, Component, Container } from 'hardwired-react';

import { render } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { dispatch } from '../DispatchResolver';

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
  function setup() {
    const selectStateValue = state => state.value;
    const updateAction = (newValue: string) => ({ type: 'update', newValue });

    const m = module('someModule')
      .define('initialState', _ => value({ value: 'initialValue' }))
      .define('store', _ => store(_.initialState, state => ({ value: 'updated' })))
      .define('someSelector', _ => selector(selectStateValue))
      .define('updateValue', _ => dispatch(updateAction))
      .define('DummyComponentContainer', _ =>
        component(DummyComponent, {
          value: _.someSelector,
          onUpdateClick: _.updateValue,
        }),
      );

    return render(
      <Container>
        <Component module={m} name={'DummyComponentContainer'} />
      </Container>,
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
