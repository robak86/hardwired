import { configureContainer, container, scoped, singleton } from 'hardwired';
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
      const val1Def = scoped<string>();
      const val2Def = scoped<number>();

      // @ts-ignore
      const _Component = () => {
        const [val1, val2] = useAll(val1Def, val2Def);

        expectType<TypeEqual<typeof val1, string>>(true);
        expectType<TypeEqual<typeof val2, number>>(true);
      };
    });
  });

  describe(`instantiating dependencies`, () => {
    const val1Def = singleton<string>('val1');
    const val2Def = singleton<string>('val2');

    function setup() {
      const Consumer = () => {
        const values = useAll(val1Def, val2Def);

        return <DummyComponent value={values.join(',')} />;
      };

      const c = container.new(c => {
        c.add(val1Def).static('val1');
        c.add(val2Def).static('val2');
      });

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
      const clsDef = scoped<number>(`clsDef`);

      const Consumer = () => {
        const [cls] = useAll(clsDef);

        return <DummyComponent value={cls} />;
      };

      const c = container.new(c => {
        c.add(clsDef).fn(checkoutRenderId);
      });

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
      const someExternalParam = scoped<string>();
      const val1Def = scoped<string>();
      const val2Def = scoped<string>();

      // const val1Def = fn.scoped(use => {
      //   const ext = use(someExternalParam);
      //
      //   return `def:1,render:${checkoutRenderId()};value:${ext}`;
      // });
      //
      // const val2Def = fn.scoped(use => {
      //   const ext = use(someExternalParam);
      //
      //   return `def:2,render:${checkoutRenderId()};value:${ext}`;
      // });

      let counter = 0;
      const checkoutRenderId = () => (counter += 1);

      const Consumer: FC<{ externalValue: string }> = () => {
        const values = useAll(val1Def, val2Def);

        return <DummyComponent value={values.join('|')} />;
      };

      const c = container.new(c => {
        c.add(val1Def).fn(ext => `def:1,render:${checkoutRenderId()};value:${ext}`, someExternalParam);
        c.add(val2Def).fn(ext => `def:2,render:${checkoutRenderId()};value:${ext}`, someExternalParam);
      });

      const TestSubject = ({ externalValue }: { externalValue: string }) => {
        const config = useScopeConfig(
          scope => {
            scope.add(someExternalParam).static(externalValue);
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
    const mountableServiceD = singleton<MountableService>('mountableServiceD');
    const mountableServiceOtherD = singleton<MountableServiceOther>('mountableServiceOther');
    const mountableServiceConsumerD = scoped<MountableServiceConsumer>(`mountableServiceConsumer`);

    class MountableService implements IReactLifeCycleAware {
      id = Math.random();

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    class MountableServiceOther implements IReactLifeCycleAware {
      id = Math.random();

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    class MountableServiceConsumer {
      id = Math.random();

      constructor(private _mountableService: MountableService) {}

      get dependencyId() {
        return this._mountableService.id;
      }

      onMount = vi.fn();
      onUnmount = vi.fn();
    }

    const configure = configureContainer(c => {
      c.add(mountableServiceD).class(MountableService);
      c.add(mountableServiceOtherD).class(MountableServiceOther);
      c.add(mountableServiceConsumerD).class(MountableServiceConsumer, mountableServiceD);
    });

    describe(`single scope`, () => {
      it(`calls mount on component mount`, async () => {
        const cnt = container.new(withReactLifeCycle(), configure);

        const OtherConsumer = () => {
          useAll(mountableServiceD, mountableServiceOtherD);

          return <DummyComponent value={'irrelevant'} />;
        };

        const Consumer = () => {
          useAll(mountableServiceD, mountableServiceOtherD);

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

        const svc = await cnt.use(mountableServiceD);

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).not.toHaveBeenCalled();

        const otherSvc = await cnt.use(mountableServiceOtherD);

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

          const [svc] = useAll(mountableServiceConsumerD);

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

        expect((await cnt.use(mountableServiceD)).onMount).toBeCalledTimes(0);
        expect((await cnt.use(mountableServiceD)).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={true} renderScope2={true} />);

        expect((await cnt.use(mountableServiceD)).onMount).toBeCalledTimes(1);
        expect((await cnt.use(mountableServiceD)).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={true} renderScope2={false} />);

        expect((await cnt.use(mountableServiceD)).onMount).toBeCalledTimes(1);
        expect((await cnt.use(mountableServiceD)).onUnmount).toBeCalledTimes(0);

        result.rerender(<App renderScope1={false} renderScope2={false} />);

        expect((await cnt.use(mountableServiceD)).onMount).toBeCalledTimes(1);
        expect((await cnt.use(mountableServiceD)).onUnmount).toBeCalledTimes(1);

        result.rerender(<App renderScope1={true} renderScope2={false} />);

        expect((await cnt.use(mountableServiceD)).onMount).toBeCalledTimes(2);
        expect((await cnt.use(mountableServiceD)).onUnmount).toBeCalledTimes(1);
      });
    });
  });
});
