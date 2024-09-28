import { container, fn, value } from 'hardwired';
import { inject } from '../inject.js';

import { render } from '@testing-library/react';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import { describe, expect, it } from 'vitest';

/**
 * @vitest-environment happy-dom
 */

describe(`inject`, () => {
  describe(`injecting dependencies`, () => {
    function setup() {
      const valueA = value(1);
      const valueB = value(2);

      const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => <div data-testid={testId}>{value}</div>;

      const Cmp = inject({ valueA, valueB })(({ valueA, valueB }) => {
        return (
          <>
            <ValueRenderer testId={'valueA'} value={valueA} />
            <ValueRenderer testId={'valueB'} value={valueB} />
          </>
        );
      });

      const cnt = container.new();

      const result = render(
        <ContainerProvider container={cnt}>
          <Cmp />
        </ContainerProvider>,
      );

      return {
        result,
        getValueA: () => result.getByTestId('valueA').textContent,
        getValueB: () => result.getByTestId('valueB').textContent,
      };
    }

    it(`injects dependencies`, async () => {
      const { getValueA, getValueB } = setup();
      expect(getValueA()).toEqual('1');
      expect(getValueB()).toEqual('2');
    });
  });

  describe(`providing dependencies manually`, () => {
    function setup() {
      const valueA = value(1);
      const valueB = value(2);

      const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => <div data-testid={testId}>{value}</div>;

      const Cmp = inject({ valueA, valueB })(({ valueA, valueB }) => {
        return (
          <>
            <ValueRenderer testId={'valueA'} value={valueA} />
            <ValueRenderer testId={'valueB'} value={valueB} />
          </>
        );
      });

      const cnt = container.new();

      const result = render(
        <ContainerProvider container={cnt}>
          <Cmp valueA={100} />
        </ContainerProvider>,
      );

      return {
        result,
        getValueA: () => result.getByTestId('valueA').textContent,
        getValueB: () => result.getByTestId('valueB').textContent,
      };
    }

    it(`injects dependencies`, async () => {
      const { getValueA, getValueB } = setup();
      expect(getValueA()).toEqual('100');
      expect(getValueB()).toEqual('2');
    });
  });

  describe(`request`, () => {
    function setup() {
      const valueA = fn.scoped(() => Math.random());

      const ValueRenderer = ({ testId, value }: { testId: any; value: any }) => <div data-testid={testId}>{value}</div>;

      const Cmp = inject({ valueA, valueB: valueA })(({ valueA, valueB }) => {
        return (
          <>
            <ValueRenderer testId={'valueA'} value={valueA} />
            <ValueRenderer testId={'valueB'} value={valueB} />
          </>
        );
      });

      const cnt = container.new();

      const result = render(
        <ContainerProvider container={cnt}>
          <Cmp />
        </ContainerProvider>,
      );

      return {
        result,
        getValueA: () => result.getByTestId('valueA').textContent,
        getValueB: () => result.getByTestId('valueB').textContent,
      };
    }

    it(`creates all instances using the same request scope`, async () => {
      const { getValueA, getValueB } = setup();
      expect(getValueA()).toEqual(getValueB());
    });
  });
});
