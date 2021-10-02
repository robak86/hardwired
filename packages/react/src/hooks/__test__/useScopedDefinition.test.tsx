import { scoped } from 'hardwired';
import React, { FC } from 'react';

import { render } from '@testing-library/react';
import { useScopedDefinition } from '../useScopedDefinition';
import { ContainerProvider } from '../../components/ContainerProvider';

describe(`useScopedDefinition`, () => {
  describe(`without invalidation keys`, () => {
    function setup() {
      let counter = 0;
      const valueDef = scoped.fn(() => (counter += 1));

      const ValueRenderer = ({ testId, deps }) => {
        const value = useScopedDefinition(deps, valueDef);

        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject = () => (
        <ContainerProvider>
          <ValueRenderer testId={'scope1'} deps={[]} />
          <ValueRenderer testId={'scope2'} deps={[]} />
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

  describe(`with invalidation keys`, () => {
    function setup() {
      let counter = 0;
      const valueDef = scoped.fn(() => (counter += 1));

      const ValueRenderer = ({ testId, deps }) => {
        const value = useScopedDefinition(deps, valueDef);

        return <div data-testid={testId}>{value}</div>;
      };

      const TestSubject: FC<{ scope1Keys: ReadonlyArray<any>; scope2Keys: ReadonlyArray<any> }> = ({
        scope1Keys,
        scope2Keys,
      }) => (
        <ContainerProvider>
          <ValueRenderer testId={'scope1'} deps={scope1Keys} />
          <ValueRenderer testId={'scope2'} deps={scope2Keys} />
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
});
