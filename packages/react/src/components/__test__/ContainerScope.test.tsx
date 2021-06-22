import { module, scoped } from 'hardwired';
import React, { FC } from 'react';
import { ContainerProvider } from '../ContainerProvider';
import { ContainerScope } from '../ContainerScope';
import { useDefinition } from '../../hooks/useDefinition';
import { render } from '@testing-library/react';

describe(`ContainerScope`, () => {
  describe(`without invalidation keys`, () => {
    function setup() {
      let counter = 0;

      const m = module()
        .define('value', scoped, () => (counter += 1))
        .build();

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

  describe(`with invalidation keys`, () => {
    function setup() {
      let counter = 0;

      const m = module()
        .define('value', scoped, () => (counter += 1))
        .build();

      const ValueRenderer = ({ testId }) => {
        const value = useDefinition(m, 'value');
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
});
