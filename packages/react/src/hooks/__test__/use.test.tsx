import { cls, container, fn, unbound } from 'hardwired';
import { render } from '@testing-library/react';
import { DummyComponent } from '../../__test__/DummyComponent.js';

import { ContainerProvider } from '../../components/ContainerProvider.js';
import { use } from '../use.js';
import { describe, expect, it } from 'vitest';
import { ContainerScope } from '../../components/ContainerScope.js';
import { FC, useState } from 'react';
import { useScopeConfig } from '../useScopeConfig.js';
import { IReactLifeCycleAware, withReactLifeCycle } from '../../interceptors/ReactLifeCycleInterceptor.js';

/**
 * @vitest-environment happy-dom
 */

describe(`use`, () => {
  describe(`types`, () => {
    it(`doesn't accept definition returning promises`, async () => {
      const asyncDef = fn.scoped(async () => 'val');
      // @ts-ignore
      const Component = () => {
        // @ts-expect-error asyncDef is async and should not be accepted
        use(asyncDef);

        return <div />;
      };
    });
  });

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
      const someExternalParam = unbound<string>();

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
            scope.bindCascading(someExternalParam).toValue(externalValue);
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

  describe(`lifecycle interceptor`, () => {
    class MountableService implements IReactLifeCycleAware {
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
        const cnt = container.new(withReactLifeCycle);

        const OtherConsumer = () => {
          use(MountableService.instance);

          return <DummyComponent value={'irrelevant'} />;
        };

        const Consumer = () => {
          use(MountableService.instance);

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

        result.rerender(<App />);

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).not.toHaveBeenCalled();

        result.unmount();

        expect(svc.onMount).toHaveBeenCalledTimes(1);
        expect(svc.onUnmount).toHaveBeenCalledTimes(1);

        const remounted = render(<App />);

        expect(svc.onMount).toHaveBeenCalledTimes(2);
        expect(svc.onUnmount).toHaveBeenCalledTimes(1);

        remounted.unmount();

        expect(svc.onMount).toHaveBeenCalledTimes(2);
        expect(svc.onUnmount).toHaveBeenCalledTimes(2);
      });

      describe(`forceMount`, () => {
        it(`forces mount of already mounted component`, async () => {
          const cnt = container.new(withReactLifeCycle);

          const ConsumerParent = ({ renderChild }: { renderChild: boolean }) => {
            use(MountableServiceConsumer.instance);

            return renderChild && <Consumer />;
          };

          const Consumer = () => {
            const [id] = useState(Math.random());
            const svc = use(MountableServiceConsumer.instance, { forceMount: true });

            return <DummyComponent value={id} optionalValue={svc.dependencyId} />;
          };

          const App = (props: { renderChild: boolean; other?: string }) => {
            return (
              <ContainerProvider container={cnt}>
                <ConsumerParent renderChild={props.renderChild} />
              </ContainerProvider>
            );
          };

          const result = render(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={true} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={true} other={'rerender on prop change'} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.unmount();
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);
        });
      });

      describe(`forceReMount`, () => {
        it(`forces mount of already mounted component`, async () => {
          const cnt = container.new(withReactLifeCycle);

          const ConsumerParent = ({ renderChild }: { renderChild: boolean }) => {
            use(MountableServiceConsumer.instance);

            return renderChild && <Consumer />;
          };

          const Consumer = () => {
            const [id] = useState(Math.random());
            const svc = use(MountableServiceConsumer.instance, { forceRemount: true });

            return <DummyComponent value={id} optionalValue={svc.dependencyId} />;
          };

          const App = (props: { renderChild: boolean; other?: string }) => {
            return (
              <ContainerProvider container={cnt}>
                <ConsumerParent renderChild={props.renderChild} />
              </ContainerProvider>
            );
          };

          const result = render(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={true} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);

          result.rerender(<App renderChild={true} other={'rerender on prop change'} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);

          result.rerender(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(2);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(2);

          result.unmount();
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(2);
        });
      });

      describe(`skipLifecycle`, () => {
        it(`skips calling mount/unmount callbacks`, async () => {
          const cnt = container.new(withReactLifeCycle());

          const ConsumerParent = ({ renderChild }: { renderChild: boolean }) => {
            use(MountableServiceConsumer.instance);

            return renderChild && <Consumer />;
          };

          const Consumer = () => {
            const [id] = useState(Math.random());
            const svc = use(MountableServiceConsumer.instance, { skipLifecycle: true });

            return <DummyComponent value={id} optionalValue={svc.dependencyId} />;
          };

          const App = (props: { renderChild: boolean; other?: string }) => {
            return (
              <ContainerProvider container={cnt}>
                <ConsumerParent renderChild={props.renderChild} />
              </ContainerProvider>
            );
          };

          const result = render(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={true} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={true} other={'rerender on prop change'} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.rerender(<App renderChild={false} />);

          expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

          result.unmount();
          expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);
        });
      });
    });

    describe(`scoped instances`, () => {
      it(`correctly calls mount/unmount for shared singleton used from scoped definition used in multiple scopes`, async () => {
        const cnt = container.new(withReactLifeCycle);

        const ScopedConsumer = () => {
          const [id] = useState(Math.random());
          const svc = use(MountableServiceConsumer.instance);

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

      it(`calls correctly callbacks when service is used within list item`, async () => {
        const cnt = container.new(withReactLifeCycle);

        const ScopedConsumer = () => {
          const [id] = useState(Math.random());
          const svc = use(MountableServiceConsumer.instance);

          return <DummyComponent value={id} optionalValue={svc.dependencyId} />;
        };

        type ScopeConfig = {
          isEnabled: boolean;
        };

        const App = (props: { scopes: ScopeConfig[] }) => {
          return (
            <ContainerProvider container={cnt}>
              {props.scopes.map((scope, index) => {
                return (
                  <div key={index}>
                    {scope.isEnabled && (
                      <ContainerScope>
                        <ScopedConsumer />
                      </ContainerScope>
                    )}
                  </div>
                );
              })}
            </ContainerProvider>
          );
        };

        function randomScopeConfigs(num: number) {
          return Array.from({ length: num }).map(idx => {
            return {
              isEnabled: Math.random() > 0.5,
            };
          });
        }

        const scopes = [{ isEnabled: true }, ...randomScopeConfigs(10)];

        const result = render(<App scopes={scopes} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

        for (let i = 0; i < 20; i++) {
          result.rerender(<App scopes={[{ isEnabled: true }, ...randomScopeConfigs(20)]} />);
        }

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(0);

        result.rerender(<App scopes={[]} />);

        expect(cnt.use(MountableService.instance).onMount).toBeCalledTimes(1);
        expect(cnt.use(MountableService.instance).onUnmount).toBeCalledTimes(1);
      });
    });
  });
});
