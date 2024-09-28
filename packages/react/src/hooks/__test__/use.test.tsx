import { container, fn, unbound } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent.js';

import { ContainerProvider } from '../../components/ContainerProvider.js';
import { use } from '../use.js';
import { describe, expect, it } from 'vitest';
import { ContainerScope } from '../../components/ContainerScope.js';
import { FC } from 'react';
import { useScopeConfig } from '../useScopeConfig.js';

/**
 * @vitest-environment happy-dom
 */

describe(`use`, () => {
  describe(`instantiating dependencies`, () => {
    const val1Def = fn.singleton(() => 'val1');

    function setup() {
      const Consumer = () => {
        const val1 = use(val1Def);
        return <DummyComponent value={val1} />;
      };

      const c = container.new();

      return render(
        <ContainerProvider container={c}>
          <Consumer />
        </ContainerProvider>,
      );
    }

    it(`gets dependency from the module`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });
  });

  describe(`binding request dependencies to component instance`, () => {
    function setup() {
      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const clsDef = fn.scoped(checkoutRenderId);

      const Consumer = () => {
        const cls = use(clsDef);
        return <DummyComponent value={cls} />;
      };

      const c = container.new();

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
      const { TestSubject } = setup();
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
      const someExternalParam = unbound<string>('ext');

      const val1Def = fn.scoped(use => {
        const ext = use(someExternalParam);
        return `render:${checkoutRenderId()};value:${ext}`;
      });

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: FC<{ externalValue: string }> = ({ externalValue }) => {
        const val1 = use(val1Def);
        return <DummyComponent value={val1} />;
      };

      const c = container.new();

      const TestSubject = ({ externalValue }: { externalValue: string }) => {
        const config = useScopeConfig(
          scope => {
            scope.bind(someExternalParam).toValue(externalValue);
          },
          [externalValue],
        );

        return (
          <ContainerProvider container={c}>
            <ContainerScope invalidateKeys={[externalValue]} config={config}>
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
      expect(result.getByTestId('value').textContent).toEqual('render:1;value:initialValue');
    });

    it(`does not revalidate instance if external parameter does not change`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual('render:1;value:initialValue');
      result.rerender(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual('render:1;value:initialValue');
    });

    it(`revalidates instance on external parameter change`, async () => {
      const { TestSubject } = setup();
      const result = render(<TestSubject externalValue={'initialValue'} />);
      expect(result.getByTestId('value').textContent).toEqual('render:1;value:initialValue');
      result.rerender(<TestSubject externalValue={'changed'} />);
      expect(result.getByTestId('value').textContent).toEqual('render:2;value:changed');
    });
  });
});
