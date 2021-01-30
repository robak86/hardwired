import { literal, module } from 'hardwired';
import { ContainerProvider } from '../ContainerProvider';
import React from 'react';
import { ModuleObject } from '../ModuleObject';
import { render } from '@testing-library/react';

describe(`ModuleObject`, () => {
  function setup() {
    const m1 = module('example').define(
      'value',
      literal(() => 1),
    );

    const m2 = module('example')
      .import('m1', m1)
      .define(
        'valueFromM1',
        literal(({ m1 }) => m1.value + 10),
      );

    const ValueRenderer = ({ testId, value }) => {
      return <div data-testid={testId}>{value}</div>;
    };

    const TestSubject = () => (
      <ContainerProvider>
        <ModuleObject
          module={m1}
          render={({ value }) => {
            return (
              <>
                <ValueRenderer testId={'topModuleRender'} value={value} />
                <ModuleObject
                  module={m2}
                  render={({ valueFromM1 }) => {
                    return <ValueRenderer testId={'childModuleRender'} value={valueFromM1} />;
                  }}
                />
              </>
            );
          }}
        />
      </ContainerProvider>
    );

    return { TestSubject };
  }

  it(`correctly resolves definitions for nested ModuleObjects`, async () => {
    const { TestSubject } = setup();
    const result = render(<TestSubject />);

    expect(result.getByTestId('topModuleRender').textContent).toEqual('1');
    expect(result.getByTestId('childModuleRender').textContent).toEqual('11');
  });
});
