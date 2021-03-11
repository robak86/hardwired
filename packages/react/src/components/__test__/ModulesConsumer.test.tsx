import { Module, module, singleton } from 'hardwired';
import { ContainerProvider } from '../ContainerProvider';
import React from 'react';
import { ModulesConsumer } from '../ModulesConsumer';
import { render } from '@testing-library/react';

describe(`ModulesConsumer`, () => {
  describe(`nesting modules`, () => {
    function setup() {
      const m1 = module()
        .define('value', singleton, () => 1)
        .build();

      const m2 = module()
        .import('m1', m1)
        .define('valueFromM1', singleton, ({ m1 }) => m1.value + 10)
        .build();

      const ValueRenderer = ({ testId, value }) => {
        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject = () => (
        <ContainerProvider>
          <ModulesConsumer
            modules={[m1]}
            render={([{ value }]) => {
              return (
                <>
                  <ValueRenderer testId={'topModuleRender'} value={value} />
                  <ModulesConsumer
                    modules={[m2]}
                    render={([{ valueFromM1 }]) => {
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

  describe(`using modules array`, () => {
    function setup() {
      const m1 = module()
        .define('value', singleton, () => 1)
        .build();

      const m2 = module()
        .import('m1', m1)
        .define('valueFromM1', singleton, ({ m1 }) => m1.value + 10)
        .build();

      const ValueRenderer = ({ testId, value }) => {
        return <div data-testid={testId}>{value}</div>;
      };

      const renderFn = ([{ value }, { valueFromM1 }]: Module.MaterializedArray<[typeof m1, typeof m2]>) => {
        return (
          <>
            <ValueRenderer testId={'topModuleRender'} value={value} />
            <ValueRenderer testId={'childModuleRender'} value={valueFromM1} />;
          </>
        );
      };

      const TestSubject = () => (
        <ContainerProvider>
          <ModulesConsumer modules={[m1, m2]} render={renderFn} />
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
});
