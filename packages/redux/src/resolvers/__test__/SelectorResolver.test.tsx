import { container, factory, module, value } from 'hardwired';
import { ContainerProvider, useWatchable } from 'hardwired-react';
import { render } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { selector } from '../SelectorResolver';
import { dispatch } from '../DispatchResolver';
import { AppState, StoreFactory } from '../../tests/StoreFactory';
import { storeFactory } from '../StoreFactory';
import { provider } from 'hardwired-react';
import { Provider } from 'react-redux';

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

const selectStateValue = (state: AppState) => state.value;
const toUpperCase = (s: string) => s.toUpperCase();
const updateAction = (newValue: string) => ({ type: 'update', newValue });
const updateReducer = (state, action) => {
  if (action.type === 'update') {
    return { value: 'updated' };
  }
  return state;
};

const reduxModule = module('reduxModule')
  .define('initialState', value({ value: 'initialValue' }))
  .define('rootReducer', value(updateReducer))
  .define('store', storeFactory(StoreFactory), ['rootReducer', 'initialState'])
  .define('updateValue', dispatch(updateAction), ['store'])
  .defineStructured('reduxProvider', provider(Provider), { store: 'store' } as any);

describe(`SelectorResolver`, () => {
  it.todo('TODO');
  // describe(`flat module`, () => {
  //   function setup() {
  //     const m = reduxModule.define('someSelector', selector(selectStateValue, 0), ['store']);
  //
  //     const Container = () => {
  //       const value = useWatchable(m, 'someSelector');
  //       const onUpdate = useWatchable(m, 'updateValue');
  //       return <DummyComponent value={value} onUpdateClick={onUpdate} />;
  //     };
  //
  //     const c = container();
  //
  //     return render(
  //       <ContainerProvider container={c}>
  //         <Container />
  //       </ContainerProvider>,
  //     );
  //   }
  //
  //   it(`correctly select initial state value`, async () => {
  //     const result = setup();
  //     expect(result.getByTestId('value').textContent).toEqual('initialValue');
  //   });
  //
  //   it(`rerender component on store change`, async () => {
  //     const result = setup();
  //     expect(result.getByTestId('value').textContent).toEqual('initialValue');
  //     const button = await result.findByRole('button');
  //     button.click();
  //     expect(result.getByTestId('value').textContent).toEqual('updated');
  //   });
  // });
  //
  // describe(`composite selectors`, () => {
  //   function setup() {
  //     const selectorsModule = module('selectors')
  //       .import('redux', () => reduxModule)
  //       .define('someSelector', selector(selectStateValue, 0), ['redux.store'])
  //       .define('compositeSelector', selector(toUpperCase, 1), ['redux.store', 'someSelector']);
  //
  //     const Container = () => {
  //       const value = useWatchable(selectorsModule, 'compositeSelector');
  //       const onUpdate = useWatchable(reduxModule, 'updateValue');
  //       return <DummyComponent value={value} onUpdateClick={onUpdate} />;
  //     };
  //
  //     const c = container();
  //
  //     const Component = () => {
  //       return (
  //         <ContainerProvider container={c}>
  //           <Container />
  //         </ContainerProvider>
  //       );
  //     };
  //
  //     return {
  //       Component,
  //       selectorsModule,
  //       container: c,
  //     };
  //   }
  //
  //   it(`correctly select initial state value`, async () => {
  //     const { Component } = setup();
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('INITIALVALUE');
  //   });
  //
  //   it(`rerender component on store change`, async () => {
  //     const { Component } = setup();
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('INITIALVALUE');
  //     const button = await result.findByRole('button');
  //     button.click();
  //     expect(result.getByTestId('value').textContent).toEqual('UPDATED');
  //   });
  //
  //   it(`allows to easily mock selector`, async () => {
  //     const { Component, selectorsModule, container } = setup();
  //     container.inject(selectorsModule.replace('someSelector', value('mockedValue')));
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('MOCKEDVALUE');
  //   });
  //
  //   it(`allows to easily mock final composite selector`, async () => {
  //     const { Component, selectorsModule, container } = setup();
  //     container.inject(selectorsModule.replace('compositeSelector', value('mockedValue')));
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('mockedValue');
  //   });
  // });
  //
  // describe(`composite selector using other composite selector`, () => {
  //   function setup() {
  //     const selectorsModule = module('selectors')
  //       .import('redux', () => reduxModule)
  //       .define('someSelector', selector(selectStateValue, 0), ['redux.store'])
  //       .define('compositeSelector', selector(toUpperCase, 1), ['redux.store', 'someSelector'])
  //       .define(
  //         'uberCompositeSelector',
  //         selector((arg1, arg2) => arg1 + '_' + arg2, 2),
  //         ['redux.store', 'someSelector', 'compositeSelector'],
  //       );
  //
  //     const Container = () => {
  //       const value = useWatchable(selectorsModule, 'uberCompositeSelector');
  //       const onUpdate = useWatchable(reduxModule, 'updateValue');
  //       return <DummyComponent value={value} onUpdateClick={onUpdate} />;
  //     };
  //
  //     const c = container();
  //
  //     const Component = () => {
  //       return (
  //         <ContainerProvider container={c}>
  //           <Container />
  //         </ContainerProvider>
  //       );
  //     };
  //
  //     return {
  //       Component,
  //       selectorsModule,
  //       container: c,
  //     };
  //   }
  //
  //   it(`correctly select initial state value`, async () => {
  //     const { Component } = setup();
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('initialValue_INITIALVALUE');
  //   });
  //
  //   it(`rerender component on store change`, async () => {
  //     const { Component } = setup();
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('initialValue_INITIALVALUE');
  //     const button = await result.findByRole('button');
  //     button.click();
  //     expect(result.getByTestId('value').textContent).toEqual('updated_UPDATED');
  //   });
  //
  //   it(`allows to easily mock selector`, async () => {
  //     const { Component, selectorsModule, container } = setup();
  //     container.inject(selectorsModule.replace('someSelector', value('mockedValue')));
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('mockedValue_MOCKEDVALUE');
  //   });
  //
  //   it(`allows to easily mock final composite selector`, async () => {
  //     const { Component, selectorsModule, container } = setup();
  //     container.inject(selectorsModule.replace('uberCompositeSelector', value('mockedValue')));
  //     const result = render(<Component />);
  //     expect(result.getByTestId('value').textContent).toEqual('mockedValue');
  //   });
  // });
});
