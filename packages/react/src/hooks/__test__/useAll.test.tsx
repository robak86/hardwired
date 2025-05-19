import { cls, container, fn, unbound } from 'hardwired';
import { render } from '@testing-library/react';
import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe, expect, it } from 'vitest';
import type { FC } from 'react';
import { useState } from 'react';

import { DummyComponent } from '../../__test__/DummyComponent.js';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import { useAll } from '../useAll.js';
import { ContainerScope } from '../../components/ContainerScope.js';
import { useScopeConfig } from '../useScopeConfig.js';
import type { IReactLifeCycleAware } from '../../interceptors/ReactLifeCycleInterceptor.js';
import { withReactLifeCycle } from '../../interceptors/ReactLifeCycleInterceptor.js';

/**
 * @vitest-environment happy-dom
 */

describe(`useDefinitions`, () => {
  describe(`types`, () => {
    it(`returns correct types`, async () => {
      const val1Def = fn.scoped(() => 'someString');
      const val2Def = fn.scoped(() => 123);

      // @ts-ignore
      const _Component = () => {
        const [val1, val2] = useAll(val1Def, val2Def);

        expectType<TypeEqual<typeof val1, string>>(true);
        expectType<TypeEqual<typeof val2, number>>(true);
      };
    });
  });

  describe(`instantiating dependencies`, () => {
    const val1Def = fn.singleton(() => 'val1');
    const val2Def = fn.singleton(() => 'val2');

    function setup() {
      const Consumer = () => {
        const values = useAll(val1Def, val2Def);

        return <DummyComponent value={values.join(',')} />;
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

      expect(wrapper.getByTestId('value').textContent).toEqual('val1,val2');
    });
  });

  describe(`binding request dependencies to component instance`, () => {
    function setup() {
      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const clsDef = fn.scoped(checkoutRenderId);

      const Consumer = () => {
        const [cls] = useAll(clsDef);

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
      const someExternalParam = unbound.scoped<string>();

      const val1Def = fn.scoped(use => {
        const ext = use(someExternalParam);

        return `def:1,render:${checkoutRenderId()};value:${ext}`;
      });

      const val2Def = fn.scoped(use => {
        const ext = use(someExternalParam);

        return `def:2,render:${checkoutRenderId()};value:${ext}`;
      });

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: FC<{ externalValue: string }> = () => {
        const values = useAll(val1Def, val2Def);

        return <DummyComponent value={values.join('|')} />;
      };

      const c = container.new();

      const TestSubject = ({ externalValue }: { externalValue: string }) => {
        const config = useScopeConfig(
          scope => {
            scope.bindCascading(someExternalParam).toValue(externalValue);
          },
          [externalValue],
        );

        return (
          <ContainerProvider container={c}>
            <ContainerScope config={config} invalidateKeys={[externalValue]}>
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

  describe(`lifecycle interceptor`, () => {
    class MountableService implements IReactLifeCycleAware {
      static instance = cls.singleton(this);

      id = Math.random();

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    class MountableServiceOther implements IReactLifeCycleAware {
      static instance = cls.singleton(this);

      id = Math.random();

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    class MountableServiceConsumer {
      static instance = cls.scoped(this, [MountableService.instance]);

      id = Math.random();

      constructor(private _mountableService: MountableService) {}

      get dependencyId() {
        return this._mountableService.id;
      }

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    describe(`single scope`, () => {
      it(`calls mount on component mount`, async () => {
        const cnt = container.new(withReactLifeCycle());

        const OtherConsumer = () => {
          useAll(MountableService.instance, MountableServiceOther.instance);

          return <DummyComponent value={'irrelevant'} />;
        };

        const Consumer = () => {
          useAll(MountableService.instance, MountableServiceOther.instance);

          return <OtherConsumer />;
        };

        const App = () => {
          return (
            <ContainerProvider container={cnt}>
              <Consumer />
            </ContainerProvider>
          );
        };

        const result = render(<App />);

        const svc = cnt.use(MountableService.instance);

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).not.toHaveBeenCalled();

        const otherSvc = cnt.use(MountableServiceOther.instance);

        expect(otherSvc.onMount).toHaveBeenCalledTimes(1);
        expect(otherSvc.onUnmount).not.toHaveBeenCalled();

        result.rerender(<App />);

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).not.toHaveBeenCalled();

        expect(otherSvc.onMount).toHaveBeenCalledTimes(1);
        expect(otherSvc.onUnmount).not.toHaveBeenCalled();

        result.unmount();

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).toHaveBeenCalledTimes(1);

        expect(otherSvc.onMount).toHaveBeenCalledTimes(1);
        expect(otherSvc.onUnmount).toHaveBeenCalledTimes(1);

        const remounted = render(<App />);

        expect(svc.onMount).toHaveBeenCalledTimes(2);
        expect(svc.onUnmount).toHaveBeenCalledTimes(1);

        expect(otherSvc.onMount).toHaveBeenCalledTimes(2);
        expect(otherSvc.onUnmount).toHaveBeenCalledTimes(1);

        remounted.unmount();

        expect(svc.onMount).toHaveBeenCalledTimes(2);
        expect(svc.onUnmount).toHaveBeenCalledTimes(2);

        expect(otherSvc.onMount).toHaveBeenCalledTimes(2);
        expect(otherSvc.onUnmount).toHaveBeenCalledTimes(2);
      });
    });

    describe(`scoped instances`, () => {
      it(`correctly calls mount/unmount for shared singleton used from scoped definition used in multiple scopes`, async () => {
        const cnt = container.new(withReactLifeCycle());

        const ScopedConsumer = () => {
          const [id] = useState(Math.random());
          const [svc] = useAll(MountableServiceConsumer.instance);

          return <DummyComponent value={id} optionalValue={svc.dependencyId} />;
        };

        const App = (props: { renderScope1: boolean; renderScope2: boolean }) => {
          return (
            <ContainerProvider container={cnt}>
              <div>
                {props.renderScope1 && (
                  <ContainerScope>
                    <ScopedConsumer />
                  </ContainerScope>
                )}
              </div>
              <div>
                {props.renderScope2 && (
                  <ContainerScope>
                    <ScopedConsumer />
                  </ContainerScope>
                )}
              </div>
            </ContainerProvider>
          );
        };

        const result = render(<App renderScope1={false} renderScope2={false} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(0);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={true} renderScope2={true} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={true} renderScope2={false} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={false} renderScope2={false} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);

        result.rerender(<App renderScope1={true} renderScope2={false} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);
      });
    });
  });
});
