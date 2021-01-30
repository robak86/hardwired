import { literal, module, Scope } from 'hardwired';
import React from 'react';
import { ContainerProvider } from '../ContainerProvider';
import { ContainerScope } from '../ContainerScope';
import { useDefinition } from '../../hooks/useDefinition';
import { render } from '@testing-library/react';

describe(`ContainerScope`, () => {
  function setup() {
    let counter = 0;

    const m = module().define(
      'value',
      literal(() => (counter += 1), Scope.request),
    );

    const ValueRenderer = ({ testId }) => {
      const value = useDefinition(m, 'value');

      return <div data-testid={testId}>{value}</div>;
    };

    const TestSubject = () => (
      <ContainerProvider>
        <ContainerScope>
          <ValueRenderer testId={'scope1'} />
        </ContainerScope>
        <ContainerScope>
          <ValueRenderer testId={'scope2'} />
        </ContainerScope>
      </ContainerProvider>
    );

    return { TestSubject };
  }

  it(`renders descendent components using new request scope`, async () => {
    const { TestSubject } = setup();
    const result = render(<TestSubject />);
    expect(result.getByTestId('scope1').textContent).toEqual('1');
    expect(result.getByTestId('scope2').textContent).toEqual('2');
    result.rerender(<TestSubject />);

    expect(result.getByTestId('scope1').textContent).toEqual('1');
    expect(result.getByTestId('scope2').textContent).toEqual('2');

    result.unmount();
    result.rerender(<TestSubject />);

    expect(result.getByTestId('scope1').textContent).toEqual('3');
    expect(result.getByTestId('scope2').textContent).toEqual('4');
  });
});
