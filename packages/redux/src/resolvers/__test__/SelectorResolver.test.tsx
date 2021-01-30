import { container, module, value } from 'hardwired';
import { ContainerProvider, useDefinition } from 'hardwired-react';
import React, { FunctionComponent } from 'react';
import { AppState, dispatch, reduxModule, selector, useSelector } from '../../__test__/TestStoreFactory';
import { render } from '@testing-library/react';

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

const selectorsModule = module('selectors')
  .define('updateValue', dispatch(updateAction))
  .define('someSelector', selector(selectStateValue))
  .define('compositeSelector', selector(toUpperCase), ['someSelector']);

describe(`SelectorResolver`, () => {
  describe(`flat module`, () => {
    function setup() {
      const Container = () => {
        const value = useSelector(selectorsModule, 'someSelector');
        const onUpdate = useDefinition(selectorsModule, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container();

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

  describe(`composite selectors`, () => {
    function setup(...overrides) {
      const Container = () => {
        const value = useSelector(selectorsModule, 'compositeSelector');
        const onUpdate = useDefinition(selectorsModule, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container({ overrides });

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
      };
    }

    it(`correctly select initial state value`, async () => {
      const { Component } = setup();
      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('INITIALVALUE');
    });

    it(`rerender component on store change`, async () => {
      const { Component } = setup();
      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('INITIALVALUE');
      const button = await result.findByRole('button');
      button.click();
      expect(result.getByTestId('value').textContent).toEqual('UPDATED');
    });

    it(`allows for mocking a selector`, async () => {
      const { Component } = setup(
        selectorsModule.replace(
          'someSelector',
          value(() => 'mockedValue'),
        ),
      );

      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('MOCKEDVALUE');
    });

    it(`allows to easily mock final composite selector`, async () => {
      const { Component } = setup(
        selectorsModule.replace(
          'compositeSelector',
          value(() => 'mockedValue'),
        ),
      );

      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('mockedValue');
    });
  });

  describe(`composite selector using other composite selector`, () => {
    const selectorsModule = module('selectors')
      .define('someSelector', selector(selectStateValue))
      .define('compositeSelector', selector(toUpperCase), ['someSelector'])
      .define('updateValue', dispatch(updateAction))

      .define(
        'uberCompositeSelector',
        selector((arg1, arg2) => arg1 + '_' + arg2),
        ['someSelector', 'compositeSelector'],
      );

    function setup(...overrides) {
      const Container = () => {
        const value = useSelector(selectorsModule, 'uberCompositeSelector');
        const onUpdate = useDefinition(selectorsModule, 'updateValue');
        return <DummyComponent value={value} onUpdateClick={onUpdate} />;
      };

      const c = container({ overrides });

      const Component = () => {
        return (
          <ContainerProvider container={c}>
            <Container />
          </ContainerProvider>
        );
      };

      return {
        Component,
        selectorsModule,
        container: c,
      };
    }

    it(`correctly select initial state value`, async () => {
      const { Component } = setup();
      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('initialValue_INITIALVALUE');
    });

    it(`rerender component on store change`, async () => {
      const { Component } = setup();
      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('initialValue_INITIALVALUE');
      const button = await result.findByRole('button');
      button.click();
      expect(result.getByTestId('value').textContent).toEqual('updated_UPDATED');
    });

    it(`allows to easily mock selector`, async () => {
      const { Component } = setup(
        selectorsModule.replace(
          'someSelector',
          value(() => 'mockedValue'),
        ),
      );

      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('mockedValue_MOCKEDVALUE');
    });

    it(`allows to easily mock final composite selector`, async () => {
      const { Component } = setup(
        selectorsModule.replace(
          'uberCompositeSelector',
          value(() => 'mockedValue'),
        ),
      );
      const result = render(<Component />);
      expect(result.getByTestId('value').textContent).toEqual('mockedValue');
    });
  });
});
