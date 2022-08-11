import { scoped, set } from 'hardwired';
import React, { FC } from 'react';
import { ContainerProvider } from '../ContainerProvider.js';
import { ContainerScope } from '../ContainerScope.js';
import { useDefinition } from '../../hooks/useDefinition.js';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';


describe(`ContainerScope`, () => {
  describe(`without invalidation keys`, () => {
    function setup() {
      let counter = 0;

      const valueD = scoped.fn(() => (counter += 1));

      const ValueRenderer = ({ testId }: { testId: any }) => {
        const value = useDefinition(valueD);

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

    it.skip(`renders descendent components using new request scope`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject />);
      expect(result.getByTestId('scope1').textContent).toEqual('1');
      expect(result.getByTestId('scope2').textContent).toEqual('2');
      result.rerender(<TestSubject />);

      expect(result.getByTestId('scope1').textContent).toEqual('1');
      expect(result.getByTestId('scope2').textContent).toEqual('2');

      // result.unmount();
      // result.rerender(<TestSubject />);
      //
      // expect(result.getByTestId('scope1').textContent).toEqual('3');
      // expect(result.getByTestId('scope2').textContent).toEqual('4');
    });
  });

  describe(`with invalidation keys`, () => {
    function setup() {
      let counter = 0;

      const valueD = scoped.fn(() => (counter += 1));

      const ValueRenderer = ({ testId }: { testId: any }) => {
        const value = useDefinition(valueD);
        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject: FC<{ scope1Keys: ReadonlyArray<any>; scope2Keys: ReadonlyArray<any> }> = ({
        scope1Keys,
        scope2Keys,
      }) => (
        <ContainerProvider>
          <ContainerScope invalidateKeys={scope1Keys}>
            <ValueRenderer testId={'scope1'} />
          </ContainerScope>
          <ContainerScope invalidateKeys={scope2Keys}>
            <ValueRenderer testId={'scope2'} />
          </ContainerScope>
        </ContainerProvider>
      );

      return { TestSubject };
    }

    it(`renders descendent components using new request scope`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject scope1Keys={['id1']} scope2Keys={['id2']} />);
      expect(result.getByTestId('scope1').textContent).toEqual('1');
      expect(result.getByTestId('scope2').textContent).toEqual('2');
      result.rerender(<TestSubject scope1Keys={['id1']} scope2Keys={['id2']} />);

      expect(result.getByTestId('scope1').textContent).toEqual('1');
      expect(result.getByTestId('scope2').textContent).toEqual('2');

      result.rerender(<TestSubject scope1Keys={['changed']} scope2Keys={['id2']} />);
      expect(result.getByTestId('scope1').textContent).toEqual('3');
      expect(result.getByTestId('scope2').textContent).toEqual('2');

      result.rerender(<TestSubject scope1Keys={['changed']} scope2Keys={['changed']} />);
      expect(result.getByTestId('scope1').textContent).toEqual('3');
      expect(result.getByTestId('scope2').textContent).toEqual('4');
    });
  });

  describe(`with overrides`, () => {
    function setup() {
      let counter = 0;

      const baseD = scoped.fn(() => 0);
      const valueD = scoped.fn(base => (counter += 1 + base), baseD);

      const ValueRenderer = ({ testId }: { testId: any }) => {
        const value = useDefinition(valueD);

        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject = () => (
        <ContainerProvider>
          S1
          <ContainerScope scopeOverrides={[set(baseD, 10)]}>
            <ValueRenderer testId={'scope1'} />
          </ContainerScope>
          S2
          <ContainerScope scopeOverrides={[set(baseD, 100)]}>
            <ValueRenderer testId={'scope2'} />
          </ContainerScope>
        </ContainerProvider>
      );

      return { TestSubject };
    }

    it.skip(`renders descendent components using new request scope`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject />);
      expect(result.getByTestId('scope1').textContent).toEqual('11');
      expect(result.getByTestId('scope2').textContent).toEqual('112');
      result.rerender(<TestSubject />);

      expect(result.getByTestId('scope1').textContent).toEqual('11');
      expect(result.getByTestId('scope2').textContent).toEqual('112');

      // result.unmount();
      // result.rerender(<TestSubject />);
      //
      // expect(result.getByTestId('scope1').textContent).toEqual('123');
      // expect(result.getByTestId('scope2').textContent).toEqual('224');
    });
  });
});
