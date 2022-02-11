import { container, request, singleton, external } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent';
import * as React from 'react';
import { ContainerProvider } from '../../components/ContainerProvider';
import { useDefinition } from '../useDefinition';
import { FC } from 'react';
import { useDefinitions } from '../useDefinitions';

describe(`useDefinitions`, () => {
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

      const clsDef = request.fn(checkoutRenderId);

      const Consumer = () => {
        const [cls] = useDefinitions([clsDef]);
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
      const someExternalParam = external<string>();
      const val1Def = request.fn((ext: string) => `def:1,render:${checkoutRenderId()};value:${ext}`, someExternalParam);
      const val2Def = request.fn((ext: string) => `def:2,render:${checkoutRenderId()};value:${ext}`, someExternalParam);

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: FC<{ externalValue: string }> = ({ externalValue }) => {
        const values = useDefinitions([val1Def, val2Def], externalValue);
        return <DummyComponent value={values.join('|')} />;
      };

      const c = container();

      const TestSubject = ({ externalValue }) => {
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
