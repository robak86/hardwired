import { fn } from 'hardwired';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContainerProvider } from '../ContainerProvider.js';
import { DefinitionsConsumer } from '../DefinitionsConsumer.js';

/**
 * @vitest-environment happy-dom
 */

describe(`InstancesConsumer`, () => {
  describe(`nesting modules`, () => {
    function setup() {
      const valDef = fn.singleton(() => 1);

      const val2Def = fn.singleton(use => {
        const val = use(valDef);

        return val + 10;
      });

      const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => {
        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject = () => (
        <ContainerProvider>
          <DefinitionsConsumer
            definitions={[valDef]}
            render={value => {
              return (
                <>
                  <ValueRenderer testId={'topModuleRender'} value={value} />
                  <DefinitionsConsumer
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
      const valDef = fn.singleton(() => 1);
      const val2Def = fn.singleton(use => {
        const val = use(valDef);

        return val + 10;
      });

      const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => {
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
          <DefinitionsConsumer definitions={[valDef, val2Def]} render={renderFn} />
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
