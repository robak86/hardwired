import React, { FC, ReactElement } from 'react';
import { BoxedValue } from 'hardwired/lib/__test__/BoxedValue';
import { container, object, replace, scoped, set, singleton } from 'hardwired';
import { ContainerProvider } from '../../components/ContainerProvider';
import { render, within } from '@testing-library/react';
import { withDependencies } from '../withDependencies';
import { useDefinition } from '../../hooks/useDefinition';
import { withScope } from '../withScope';

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

    const ValueRenderer = ({ testId, value }) => <div data-testid={testId}>{value}</div>;

    const ageDef = scoped.fn(() => new BoxedValue(initialAge()));
    const firstNameDef = scoped.fn(() => new BoxedValue(initialName()));

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

    const dependenciesSelector = object({
      age: ageDef,
      firstName: firstNameDef,
    });

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

  describe(`with new scope`, () => {
    describe(`overriding values`, () => {
      it(`injects dependencies as props`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: (props: { age: number }) => {
            return [
              replace(
                ageDef,
                singleton.fn(() => new BoxedValue(props.age)),
              ),
            ];
          },
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedAge, getRenderedFirstName } = renderWithContainer(
          <BoundComponent testId={'instance1'} age={99} />,
        );
        expect(getRenderedAge('instance1')).toEqual('99');
        expect(getRenderedFirstName('instance1')).toEqual('John');
      });

      it(`uses the same scope for all descendent components`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: (props: { age: number }) => {
            return [set(ageDef, new BoxedValue(props.age))];
          },
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedChildAge, getRenderedChildFirstName } = renderWithContainer(
          <BoundComponent testId={'instance1'} age={99} />,
        );
        expect(getRenderedChildAge('instance1')).toEqual('99');
        expect(getRenderedChildFirstName('instance1')).toEqual('John');
      });
    });

    describe(`using invalidation keys`, () => {
      it(`invalidate scope on key change`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: props => {
            return [set(ageDef, new BoxedValue(Math.random()))];
          },
          invalidateKeys: (props: { userId: string }) => [props.userId],
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedAge, rerender } = renderWithContainer(
          <BoundComponent testId={'instance1'} userId={'someUserId'} />,
        );
        const ageForSomeUserId = getRenderedAge('instance1');

        rerender(<BoundComponent testId={'instance1'} userId={'SOME_OTHER_ID'} />);

        const ageForSomeUserIdAfterRerender = getRenderedAge('instance1');
        expect(ageForSomeUserId).not.toEqual(ageForSomeUserIdAfterRerender);
      });

      it(`does not invalidate scope if key does not change`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: props => {
            return [set(ageDef, new BoxedValue(Math.random()))];
          },
          invalidateKeys: (props: { userId: string }) => [props.userId],
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedAge, rerender } = renderWithContainer(
          <BoundComponent testId={'instance1'} userId={'someUserId'} />,
        );
        const ageForSomeUserId = getRenderedAge('instance1');

        rerender(<BoundComponent testId={'instance1'} userId={'someUserId'} />);

        const ageForSomeUserIdAfterRerender = getRenderedAge('instance1');
        expect(ageForSomeUserId).toEqual(ageForSomeUserIdAfterRerender);
      });

      it(`creates separate scope for each instance`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: [
            replace(
              ageDef,
              singleton.fn(() => new BoxedValue(Math.random())),
            ),
          ],
          invalidateKeys: (props: { userId: string }) => [props.userId],
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedAge, rerender } = renderWithContainer(
          <>
            <BoundComponent testId={'instance1'} userId={'someUserId'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );
        const ageFromInstance1 = getRenderedAge('instance1');
        const ageFromInstance2 = getRenderedAge('instance2');
        expect(ageFromInstance1).not.toEqual(ageFromInstance2);

        rerender(
          <>
            <BoundComponent testId={'instance1'} userId={'someUserId'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );

        const ageFromInstance1AfterRerender = getRenderedAge('instance1');
        const ageFromInstance2AfterRerender = getRenderedAge('instance2');
        expect(ageFromInstance1).toEqual(ageFromInstance1AfterRerender);
        expect(ageFromInstance2).toEqual(ageFromInstance2AfterRerender);

        rerender(
          <>
            <BoundComponent testId={'instance1'} userId={'CHANGED_ID'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );

        const ageFromInstance1AfterIdChange = getRenderedAge('instance1');

        expect(ageFromInstance1AfterRerender).not.toEqual(ageFromInstance1AfterIdChange);
      });

      it(`preserves scope in descendant components`, async () => {
        const { ageDef, WrappedComponent, dependenciesSelector } = setupDefinitions({});

        const bindDependencies = withDependencies(dependenciesSelector);

        const bindScope = withScope({
          scopeOverrides: [
            replace(
              ageDef,
              singleton.fn(() => new BoxedValue(Math.random())),
            ),
          ],
          invalidateKeys: (props: { userId: string }) => [props.userId],
        });

        const BoundComponent = bindScope(bindDependencies(WrappedComponent));

        const { getRenderedChildAge, rerender } = renderWithContainer(
          <>
            <BoundComponent testId={'instance1'} userId={'someUserId'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );
        const ageFromInstance1 = getRenderedChildAge('instance1');
        const ageFromInstance2 = getRenderedChildAge('instance2');
        expect(ageFromInstance1).not.toEqual(ageFromInstance2);

        rerender(
          <>
            <BoundComponent testId={'instance1'} userId={'someUserId'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );

        const ageFromInstance1AfterRerender = getRenderedChildAge('instance1');
        const ageFromInstance2AfterRerender = getRenderedChildAge('instance2');
        expect(ageFromInstance1).toEqual(ageFromInstance1AfterRerender);
        expect(ageFromInstance2).toEqual(ageFromInstance2AfterRerender);

        rerender(
          <>
            <BoundComponent testId={'instance1'} userId={'CHANGED_ID'} />
            <BoundComponent testId={'instance2'} userId={'someUserId'} />
          </>,
        );

        const ageFromInstance1AfterIdChange = getRenderedChildAge('instance1');

        expect(ageFromInstance1AfterRerender).not.toEqual(ageFromInstance1AfterIdChange);
      });
    });

    describe(`using scope without overrides and invalidation keys`, () => {
      it(`invalidates scope after unmount`, async () => {
        const { WrappedComponent, dependenciesSelector } = setupDefinitions({
          initialAge: () => Math.random(),
        });

        const bindDependencies = withDependencies(dependenciesSelector);

        const BoundComponent = withScope()(bindDependencies(WrappedComponent));
        const { getRenderedAge, rerender, unmount, result } = renderWithContainer(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );
        const ageFromInstance1 = getRenderedAge('instance1');
        const ageFromInstance2 = getRenderedAge('instance2');

        result.unmount();

        rerender(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );

        const ageFromInstance1AfterRemount = getRenderedAge('instance1');
        const ageFromInstance2AfterRemount = getRenderedAge('instance2');

        expect(ageFromInstance1).not.toEqual(ageFromInstance1AfterRemount);
        expect(ageFromInstance2).not.toEqual(ageFromInstance2AfterRemount);
      });

      it(`creates separate scope for each instance`, async () => {
        const { WrappedComponent, dependenciesSelector } = setupDefinitions({ initialAge: () => Math.random() });

        const bindDependencies = withDependencies(dependenciesSelector);
        const BoundComponent = withScope()(bindDependencies(WrappedComponent));

        const { getRenderedAge, rerender, unmount, result } = renderWithContainer(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );
        const ageFromInstance1 = getRenderedAge('instance1');
        const ageFromInstance2 = getRenderedAge('instance2');

        rerender(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );

        const ageFromInstance1AfterRerender = getRenderedAge('instance1');
        const ageFromInstance2AfterRerender = getRenderedAge('instance2');

        expect(ageFromInstance1).toEqual(ageFromInstance1AfterRerender);
        expect(ageFromInstance2).toEqual(ageFromInstance2AfterRerender);

        result.unmount();

        rerender(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );

        const ageFromInstance1AfterRemount = getRenderedAge('instance1');
        const ageFromInstance2AfterRemount = getRenderedAge('instance2');

        expect(ageFromInstance1).not.toEqual(ageFromInstance1AfterRemount);
        expect(ageFromInstance2).not.toEqual(ageFromInstance2AfterRemount);
      });

      it(`preserves scope for each instance descendant elements`, async () => {
        const { WrappedComponent, dependenciesSelector } = setupDefinitions({ initialAge: () => Math.random() });

        const bindDependencies = withDependencies(dependenciesSelector);
        const BoundComponent = withScope()(bindDependencies(WrappedComponent));

        const { getRenderedChildAge, rerender, unmount, result } = renderWithContainer(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );
        const ageFromInstance1 = getRenderedChildAge('instance1');
        const ageFromInstance2 = getRenderedChildAge('instance2');

        rerender(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );

        const ageFromInstance1AfterRerender = getRenderedChildAge('instance1');
        const ageFromInstance2AfterRerender = getRenderedChildAge('instance2');

        expect(ageFromInstance1).toEqual(ageFromInstance1AfterRerender);
        expect(ageFromInstance2).toEqual(ageFromInstance2AfterRerender);

        result.unmount();

        rerender(
          <>
            <BoundComponent testId={'instance1'} />
            <BoundComponent testId={'instance2'} />
          </>,
        );

        const ageFromInstance1AfterRemount = getRenderedChildAge('instance1');
        const ageFromInstance2AfterRemount = getRenderedChildAge('instance2');

        expect(ageFromInstance1).not.toEqual(ageFromInstance1AfterRemount);
        expect(ageFromInstance2).not.toEqual(ageFromInstance2AfterRemount);
      });
    });
  });
});
