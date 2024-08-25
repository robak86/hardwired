import { container, fn } from 'hardwired';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import { render, within } from '@testing-library/react';
import { withDependencies } from '../withDependencies.js';
import { useDefinition } from '../../hooks/useDefinition.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { FC, ReactElement } from 'react';

/**
 * @vitest-environment happy-dom
 */

describe(`withDependencies`, () => {
  function setupDefinitions({
    initialAge = () => 100,
    initialName = () => 'John',
  }: {
    initialAge?: () => number;
    initialName?: () => string;
  }) {
    type DummyComponentProps = {
      age: BoxedValue<number>;
      firstName: BoxedValue<string>;
      testId: string;
    };

    const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => <div data-testid={testId}>{value}</div>;

    const ageDef = fn.scoped(() => new BoxedValue(initialAge()));
    const firstNameDef = fn.scoped(() => new BoxedValue(initialName()));

    const WrappedComponent: FC<DummyComponentProps> = ({ age, firstName, testId }) => {
      return (
        <div data-testid={testId}>
          <ValueRenderer testId={'age'} value={age.value} />
          <ValueRenderer testId={'firstName'} value={firstName.value} />
          <ChildComponent />
        </div>
      );
    };

    const ChildComponent = () => {
      const age = useDefinition(ageDef);
      const firstName = useDefinition(firstNameDef);
      return (
        <>
          <ValueRenderer testId={'ageFromChildComponent'} value={age.value} />
          <ValueRenderer testId={'firstNameFromChildComponent'} value={firstName.value} />
        </>
      );
    };

    const dependenciesSelector = fn(use => ({
      age: use(ageDef),
      firstName: use(firstNameDef),
    }));

    return { WrappedComponent, dependenciesSelector, ageDef, firstNameDef };
  }

  function renderWithContainer(element: ReactElement, cnt = container()) {
    const result = render(<ContainerProvider container={cnt}>{element}</ContainerProvider>);
    return {
      result,
      unmount: result.unmount,
      rerender: (element: ReactElement) => {
        result.rerender(<ContainerProvider container={cnt}>{element}</ContainerProvider>);
      },
      getRenderedAge: (testId: string) => within(result.getByTestId(testId)).getByTestId('age').textContent,
      getRenderedFirstName: (testId: string) => within(result.getByTestId(testId)).getByTestId('firstName').textContent,

      getRenderedChildAge: (testId: string) =>
        within(result.getByTestId(testId)).getByTestId('ageFromChildComponent').textContent,
      getRenderedChildFirstName: (testId: string) =>
        within(result.getByTestId(testId)).getByTestId('firstNameFromChildComponent').textContent,
    };
  }

  describe(`within current scope`, () => {
    it(`injects dependencies as props`, async () => {
      const { WrappedComponent, dependenciesSelector } = setupDefinitions({});

      const bindDependencies = withDependencies(dependenciesSelector);

      const BoundComponent = bindDependencies(WrappedComponent);

      const { getRenderedAge, getRenderedFirstName } = renderWithContainer(<BoundComponent testId={'instance1'} />);
      expect(getRenderedAge('instance1')).toEqual('100');
      expect(getRenderedFirstName('instance1')).toEqual('John');
    });

    it(`uses current scope for all instances`, async () => {
      const { WrappedComponent, dependenciesSelector } = setupDefinitions({ initialAge: () => Math.random() });

      const bindDependencies = withDependencies(dependenciesSelector);

      const BoundComponent = bindDependencies(WrappedComponent);

      const { getRenderedAge } = renderWithContainer(
        <>
          <BoundComponent testId={'instance1'} />
          <BoundComponent testId={'instance2'} />
        </>,
      );
      expect(getRenderedAge('instance1')).toEqual(getRenderedAge('instance2'));
    });

    it(`works with simplified api`, async () => {
      const { WrappedComponent, dependenciesSelector } = setupDefinitions({});

      const bindDependencies = withDependencies(dependenciesSelector);

      const BoundComponent = bindDependencies(WrappedComponent);

      const { getRenderedAge, getRenderedFirstName } = renderWithContainer(<BoundComponent testId={'instance1'} />);
      expect(getRenderedAge('instance1')).toEqual('100');
      expect(getRenderedFirstName('instance1')).toEqual('John');
    });
  });
});
