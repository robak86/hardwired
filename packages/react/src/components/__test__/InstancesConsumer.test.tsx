import { singleton } from 'hardwired';
import { ContainerProvider } from '../ContainerProvider';
import React from 'react';
import { InstancesConsumer } from '../InstancesConsumer';
import { render } from '@testing-library/react';

describe(`InstancesConsumer`, () => {
  describe(`nesting modules`, () => {
    function setup() {
      const valDef = singleton.fn(() => 1);
      const val2Def = singleton.fn(val => val + 10, valDef);

      const ValueRenderer = ({ testId, value }) => {
        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject = () => (
        <ContainerProvider>
          <InstancesConsumer
            definitions={[valDef]}
            render={value => {
              return (
                <>
                  <ValueRenderer testId={'topModuleRender'} value={value} />
                  <InstancesConsumer
                    definitions={[val2Def]}
                    render={valueFromM1 => {
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
      const valDef = singleton.fn(() => 1);
      const val2Def = singleton.fn(val => val + 10, valDef);

      const ValueRenderer = ({ testId, value }) => {
        return <div data-testid={testId}>{value}</div>;
      };

      const renderFn = (val1: number, val2: number) => {
        return (
          <>
            <ValueRenderer testId={'topModuleRender'} value={val1} />
            <ValueRenderer testId={'childModuleRender'} value={val2} />;
          </>
        );
      };

      const TestSubject = () => (
        <ContainerProvider>
          <InstancesConsumer definitions={[valDef, val2Def]} render={renderFn} />
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
