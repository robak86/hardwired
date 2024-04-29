import { scoped } from 'hardwired';
import { ContainerProvider } from '../ContainerProvider.js';
import { ContainerScope } from '../ContainerScope.js';
import { ContainerInitializer } from '../ContainerInitializer.js';
import { useDefinition } from '../../hooks/useDefinition.js';
import { render } from '@testing-library/react';
import { expect } from 'vitest';

describe(`ContainerInitializer`, () => {
  function setup() {
    class InitializeMe {
      value = 0;

      init() {
        this.value = Math.random();
      }
    }

    const initializeMe = scoped.class(InitializeMe);
    const initializer = scoped.thunk(c => {
      c.use(initializeMe).init();
    });

    const ValueRenderer = ({ testId }: { testId: any }) => {
      const value = useDefinition(initializeMe);

      return <div data-testid={testId}>{value.value}</div>;
    };

    const TestSubject = () => (
      <ContainerProvider>
        <ContainerScope>
          <ContainerInitializer init={initializer}>
            <ValueRenderer testId={'scope1'} />
          </ContainerInitializer>
        </ContainerScope>
        <ContainerScope>
          <ContainerInitializer init={initializer}>
            <ValueRenderer testId={'scope2'} />
          </ContainerInitializer>
        </ContainerScope>
      </ContainerProvider>
    );

    return { TestSubject };
  }

  it(`runs initializers`, async () => {
    const { TestSubject } = setup();
    const result = render(<TestSubject />);
    expect(result.getByTestId('scope1').textContent).toEqual('0');
    expect(result.getByTestId('scope2').textContent).toEqual('0');
    result.rerender(<TestSubject />);

    expect(result.getByTestId('scope1').textContent).not.toEqual('0');
    expect(result.getByTestId('scope2').textContent).not.toEqual('0');
    expect(result.getByTestId('scope1').textContent).not.toEqual(result.getByTestId('scope2').textContent);
  });
});
