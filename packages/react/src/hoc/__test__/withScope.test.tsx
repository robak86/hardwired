import { module, scoped } from 'hardwired';
import { useDefinition } from '../../hooks/useDefinition';
import { ContainerProvider } from '../../components/ContainerProvider';
import { render } from '@testing-library/react';
import React, { FC } from 'react';
import { withScope } from '../withScope';

describe(`withScope`, () => {
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

      const Scoped1 = withScope()(props => <ValueRenderer testId={'scope1'} />);
      const Scoped2 = withScope()(props => <ValueRenderer testId={'scope2'} />);

      const TestSubject = () => (
        <ContainerProvider>
          <Scoped1 />
          <Scoped2 />
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

      const Scoped1 = withScope({ invalidateKeys: (props: { keys: ReadonlyArray<any> }) => props.keys })(props => (
        <ValueRenderer testId={'scope1'} />
      ));
      const Scoped2 = withScope({ invalidateKeys: (props: { keys: ReadonlyArray<any> }) => props.keys })(props => (
        <ValueRenderer testId={'scope2'} />
      ));

      const TestSubject: FC<{ scope1Keys: ReadonlyArray<any>; scope2Keys: ReadonlyArray<any> }> = ({
        scope1Keys,
        scope2Keys,
      }) => (
        <ContainerProvider>
          <Scoped1 keys={scope1Keys} />
          <Scoped2 keys={scope2Keys} />
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

      const m = module()
        .define('base', scoped, () => 0)
        .define('value', scoped, ({ base }) => (counter += 1 + base))
        .build();

      const ValueRenderer = ({ testId }) => {
        const value = useDefinition(m, 'value');

        return <div data-testid={testId}>{value}</div>;
      };

      const Scoped1 = withScope({ scopeOverrides: [m.replace('base', () => 10)] })(props => (
        <ValueRenderer testId={'scope1'} />
      ));
      const Scoped2 = withScope({ scopeOverrides: [m.replace('base', () => 100)] })(props => (
        <ValueRenderer testId={'scope2'} />
      ));

      const TestSubject = () => (
        <ContainerProvider>
          <Scoped1 />
          <Scoped2 />
        </ContainerProvider>
      );

      return { TestSubject };
    }

    it(`renders descendent components using new request scope`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject />);
      expect(result.getByTestId('scope1').textContent).toEqual('11');
      expect(result.getByTestId('scope2').textContent).toEqual('112');
      result.rerender(<TestSubject />);

      expect(result.getByTestId('scope1').textContent).toEqual('11');
      expect(result.getByTestId('scope2').textContent).toEqual('112');

      result.unmount();
      result.rerender(<TestSubject />);

      expect(result.getByTestId('scope1').textContent).toEqual('123');
      expect(result.getByTestId('scope2').textContent).toEqual('224');
    });
  });
});
