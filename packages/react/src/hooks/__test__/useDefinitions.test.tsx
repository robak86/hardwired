import { container, implicit, scoped, set, singleton } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent.js';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import { useDefinitions } from '../useDefinitions.js';
import { expectType, TypeEqual } from 'ts-expect';
import { describe, expect, it } from 'vitest';
import { ContainerScope } from '../../components/ContainerScope.js';

/**
 * @vitest-environment happy-dom
 */

describe(`useDefinitions`, () => {
  describe(`types`, () => {
    it(`returns correct types`, async () => {
      const val1Def = scoped.fn(() => 'someString');
      const val2Def = scoped.fn(() => 123);

      const Component = () => {
        const [val1, val2] = useDefinitions([val1Def, val2Def]);
        expectType<TypeEqual<typeof val1, string>>(true);
        expectType<TypeEqual<typeof val2, number>>(true);
      };
    });

    it(`returns correct types using externals`, async () => {
      const ext = implicit<boolean>('ext');
      const val1Def = scoped.fn(b => 'someString', ext);
      const val2Def = scoped.fn(b => 123, ext);

      const Component = () => {
        try {
          const [val1, val2] = useDefinitions([val1Def, val2Def]);
          expectType<TypeEqual<typeof val1, string>>(true);
          expectType<TypeEqual<typeof val2, number>>(true);
        } catch (e) {
          // ext is not provided
        }
      };
    });
  });

  describe(`instantiating dependencies`, () => {
    const val1Def = singleton.fn(() => 'val1');
    const val2Def = singleton.fn(() => 'val2');

    function setup() {
      const Consumer = () => {
        const values = useDefinitions([val1Def, val2Def]);
        return <DummyComponent value={values.join(',')} />;
      };

      const c = container();

      return render(
        <ContainerProvider container={c}>
          <Consumer />
        </ContainerProvider>,
      );
    }

    it(`gets dependency from the module`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1,val2');
    });
  });

  describe(`binding request dependencies to component instance`, () => {
    function setup() {
      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const clsDef = scoped.fn(checkoutRenderId);

      const Consumer = () => {
        const [cls] = useDefinitions([clsDef]);
        return <DummyComponent value={cls} />;
      };

      const c = container();

      const TestSubject = () => {
        return (
          <ContainerProvider container={c}>
            <ContainerScope>
              <div data-testid={'consumer1'}>
                <Consumer />
              </div>
            </ContainerScope>

            <ContainerScope>
              <div data-testid={'consumer2'}>
                <Consumer />
              </div>
            </ContainerScope>
          </ContainerProvider>
        );
      };

      return { TestSubject, c };
    }

    it(`reuses the same request instance for component rerender`, async () => {
      const { TestSubject, c } = setup();
      const result = render(<TestSubject />);

      const render1Consumer1Value = result.getByTestId('consumer1').textContent;
      const render1Consumer2Value = result.getByTestId('consumer2').textContent;

      expect(render1Consumer1Value).toEqual('1');
      expect(render1Consumer2Value).toEqual('2');

      result.rerender(<TestSubject />);

      const render2Consumer1Value = result.getByTestId('consumer1').textContent;
      const render2Consumer2Value = result.getByTestId('consumer2').textContent;

      expect(render2Consumer1Value).toEqual('1');
      expect(render2Consumer2Value).toEqual('2');

      expect(render1Consumer1Value).not.toEqual(render1Consumer2Value);
    });
  });

  describe(`using externals`, () => {
    function setup() {
      const someExternalParam = implicit<string>('ext');
      const val1Def = scoped.fn((ext: string) => `def:1,render:${checkoutRenderId()};value:${ext}`, someExternalParam);
      const val2Def = scoped.fn((ext: string) => `def:2,render:${checkoutRenderId()};value:${ext}`, someExternalParam);

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: React.FC<{ externalValue: string }> = ({ externalValue }) => {
        const values = useDefinitions([val1Def, val2Def]);
        return <DummyComponent value={values.join('|')} />;
      };

      const c = container();

      const TestSubject = ({ externalValue }: { externalValue: string }) => {
        return (
          <ContainerProvider container={c}>
            <ContainerScope overrides={[set(someExternalParam, externalValue)]} invalidateKeys={[externalValue]}>
              <h1>{externalValue}</h1>
              <Consumer externalValue={externalValue} />
            </ContainerScope>
          </ContainerProvider>
        );
      };

      return { TestSubject };
    }

    it(`builds instance using external value provided by props`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual(
        'def:1,render:1;value:initialValue|def:2,render:2;value:initialValue',
      );
    });

    it(`does not revalidate instance if external parameter does not change`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual(
        'def:1,render:1;value:initialValue|def:2,render:2;value:initialValue',
      );
      result.rerender(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual(
        'def:1,render:1;value:initialValue|def:2,render:2;value:initialValue',
      );
    });

    it(`revalidates instance on external parameter change`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual(
        'def:1,render:1;value:initialValue|def:2,render:2;value:initialValue',
      );
      result.rerender(<TestSubject externalValue={'changed'} />);
      expect(result.getByTestId('value').textContent).toEqual(
        'def:1,render:3;value:changed|def:2,render:4;value:changed',
      );
    });
  });
});
