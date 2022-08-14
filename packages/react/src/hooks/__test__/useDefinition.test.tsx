import { container, request, singleton,  set, implicit } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent.js';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import { useDefinition } from '../useDefinition.js';
import { FC } from 'react';
import {describe, expect, it, vi} from 'vitest'

describe(`useDefinition`, () => {
  describe(`instantiating dependencies`, () => {
    const val1Def = singleton.fn(() => 'val1');
    const val2Def = singleton.fn(() => 'val2');

    function setup() {
      const Consumer = () => {
        const val1 = useDefinition(val1Def);
        return <DummyComponent value={val1} />;
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
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });
  });

  describe(`binding request dependencies to component instance`, () => {
    function setup() {
      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const clsDef = request.fn(checkoutRenderId);

      const Consumer = () => {
        const cls = useDefinition(clsDef);
        return <DummyComponent value={cls} />;
      };

      const c = container();

      const TestSubject = () => {
        return (
          <ContainerProvider container={c}>
            <div data-testid={'consumer1'}>
              <Consumer />
            </div>

            <div data-testid={'consumer2'}>
              <Consumer />
            </div>
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

      expect(render1Consumer1Value).toEqual(render2Consumer1Value);
      expect(render1Consumer2Value).toEqual(render2Consumer2Value);

      expect(render1Consumer1Value).not.toEqual(render1Consumer2Value);
    });
  });

  describe(`using externals`, () => {
    function setup() {
      const someExternalParam = implicit<string>('ext');
      const val1Def = request.fn((ext: string) => `render:${checkoutRenderId()};value:${ext}`, someExternalParam);

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: FC<{ externalValue: string }> = ({ externalValue }) => {
        const val1 = useDefinition(val1Def, set(someExternalParam, externalValue));
        return <DummyComponent value={val1} />;
      };

      const c = container();

      const TestSubject = ({ externalValue }: { externalValue: string }) => {
        return (
          <ContainerProvider container={c}>
            <Consumer externalValue={externalValue} />
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
