import { container, literal, unit, value } from 'hardwired';
import { ContainerProvider } from 'hardwired-react';
import { createStore } from 'redux';
import * as rtl from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { reduxFor } from '../../reduxFor';
import React from 'react';

describe('React', () => {
  type AppState = {
    count: number;
  };
  describe('hooks', () => {
    describe('useSelector', () => {
      function setup(initCountValue = -1) {
        const renderedItems: number[] = [];
        const buildTestStore = () =>
          createStore(
            ({ count }: any = { count: -1 }) => ({
              count: count + 1,
            }),
            { count: initCountValue },
          );

        const reduxModule = unit('redux')
          .define('store', literal(buildTestStore))
          .define('subscribeLog', value({ listenersCount: 0 }))
          .decorate('store', (store, { subscribeLog }) => {
            return {
              ...store,
              subscribe: listener => {
                subscribeLog.listenersCount += 1;
                const unsubscribe = store.subscribe(listener);

                return () => {
                  unsubscribe();
                  subscribeLog.listenersCount -= 1;
                };
              },
            };
          })
          .define(
            'countSelector',
            value((state: AppState) => state.count),
          )
          .define(
            'identitySelector',
            value(state => state),
          )
          .define(
            'errorThrowingSelector',
            value(state => {
              throw new Error('bonk');
            }),
          )
          .define(
            'parametrizedSelector',
            literal(({ countSelector }) => (id: number) => (state: AppState) => countSelector(state) * id),
          );

        const testContainer = container();
        const wrapper = props => <ContainerProvider container={testContainer} {...props} />;

        return { reduxModule, renderedItems, testContainer, wrapper, ...reduxFor(reduxModule, 'store') };
      }

      afterEach(() => rtl.cleanup());

      describe('core subscription behavior', () => {
        it('selects the state on initial render', () => {
          const { useSelector, wrapper, reduxModule } = setup();
          const { result } = renderHook(() => useSelector(reduxModule, 'countSelector'), {
            wrapper,
          });

          expect(result.current).toEqual(0);
        });

        it('selects the state and renders the component when the store updates', () => {
          const { useSelector, wrapper, reduxModule, testContainer } = setup();

          const { result } = renderHook(() => useSelector(reduxModule, 'countSelector'), {
            wrapper,
          });

          expect(result.current).toEqual(0);

          act(() => {
            const { store } = testContainer.asObject(reduxModule);
            store.dispatch({ type: '' });
          });

          expect(result.current).toEqual(1);
        });
      });

      describe('lifecycle interactions', () => {
        // it('always uses the latest state', () => {
        //   const { store } = setup(-;
        //
        //   const Comp = () => {
        //     const selector = useCallback(c => c + 1, []);
        //     const value = useSelector(selector);
        //     renderedItems.push(value);
        //     return <div />;
        //   };
        //
        //   rtl.render(
        //     <ProviderMock store={store}>
        //       <Comp />
        //     </ProviderMock>,
        //   );
        //
        //   expect(renderedItems).toEqual([1]);
        //
        //   store.dispatch({ type: '' });
        //
        //   expect(renderedItems).toEqual([1, 2]);
        // });

        it('subscribes to the store synchronously', () => {
          const { reduxModule, useSelector, wrapper, testContainer } = setup();
          const { store, subscribeLog } = testContainer.asObject(reduxModule);

          const Parent = () => {
            const count = useSelector(reduxModule, 'countSelector');
            return count === 1 ? <Child /> : null;
          };

          const Child = () => {
            const count = useSelector(reduxModule, 'countSelector');
            return <div>{count}</div>;
          };

          rtl.render(<Parent />, { wrapper });

          expect(subscribeLog.listenersCount).toEqual(1);

          act(() => {
            store.dispatch({ type: '' });
          });

          expect(subscribeLog.listenersCount).toEqual(2);
        });

        it('unsubscribes when the component is unmounted', () => {
          const { reduxModule, useSelector, wrapper, testContainer } = setup();

          const { subscribeLog, store } = testContainer.asObject(reduxModule);

          const Parent = () => {
            const count = useSelector(reduxModule, 'countSelector');
            return count === 0 ? <Child /> : null;
          };

          const Child = () => {
            const count = useSelector(reduxModule, 'countSelector');
            return <div>{count}</div>;
          };

          rtl.render(<Parent />, { wrapper });

          expect(subscribeLog.listenersCount).toEqual(2);

          act(() => {
            store.dispatch({ type: '' });
          });

          expect(subscribeLog.listenersCount).toEqual(1);
        });

        it('notices store updates between render and store subscription effect', () => {
          const { useSelector, reduxModule, testContainer, wrapper } = setup();
          const renderedItems: number[] = [];
          const { store } = testContainer.asObject(reduxModule);

          const Comp = () => {
            const count = useSelector(reduxModule, 'countSelector');
            renderedItems.push(count);

            if (count === 0) {
              store.dispatch({ type: '' });
            }

            return <div>{count}</div>;
          };

          rtl.render(<Comp />, { wrapper });

          expect(renderedItems).toEqual([0, 1]);
        });
      });

      // it('works properly with memoized selector with dispatch in Child useLayoutEffect', () => {
      //   store = createStore(c => c + 1, -1);
      //
      //   const Comp = () => {
      //     const selector = useCallback(c => c, []);
      //     const count = useSelector(selector);
      //     renderedItems.push(count);
      //     return <Child parentCount={count} />;
      //   };
      //
      //   const Child = ({ parentCount }) => {
      //     useLayoutEffect(() => {
      //       if (parentCount === 1) {
      //         store.dispatch({ type: '' });
      //       }
      //     }, [parentCount]);
      //     return <div>{parentCount}</div>;
      //   };
      //
      //   rtl.render(
      //     <ProviderMock store={store}>
      //       <Comp />
      //     </ProviderMock>,
      //   );
      //
      //   // The first render doesn't trigger dispatch
      //   expect(renderedItems).toEqual([0]);
      //
      //   // This dispatch triggers another dispatch in useLayoutEffect
      //   rtl.act(() => {
      //     store.dispatch({ type: '' });
      //   });
      //
      //   expect(renderedItems).toEqual([0, 1, 2]);
      // });
      //
      // describe('performance optimizations and bail-outs', () => {

      it('defaults to ref-equality to prevent unnecessary updates', () => {
        const { reduxModule, useSelector, wrapper, testContainer } = setup();

        const renderedItems: number[] = [];

        const mockedModule = reduxModule.replace(
          'store',
          literal(() => createStore((state = { count: 0 }) => state, { count: Math.random() })),
        );

        const { store } = testContainer.asObject(mockedModule);

        const Comp = () => {
          const value = useSelector(mockedModule, 'identitySelector');
          renderedItems.push(value);
          return <div />;
        };

        rtl.render(
          <Comp />,

          { wrapper },
        );

        expect(renderedItems.length).toBe(1);

        act(() => {
          store.dispatch({ type: '' });
        });

        expect(renderedItems.length).toBe(1);
      });

      //   it('allows other equality functions to prevent unnecessary updates', () => {
      //     store = createStore(({ count, stable } = { count: -1, stable: {} }) => ({
      //       count: count + 1,
      //       stable,
      //     }));
      //
      //     const Comp = () => {
      //       const value = useSelector(s => Object.keys(s), shallowEqual);
      //       renderedItems.push(value);
      //       return <div />;
      //     };
      //
      //     rtl.render(
      //       <ProviderMock store={store}>
      //         <Comp />
      //       </ProviderMock>,
      //     );
      //
      //     expect(renderedItems.length).toBe(1);
      //
      //     store.dispatch({ type: '' });
      //
      //     expect(renderedItems.length).toBe(1);
      //   });
      // });
      //
      // it('uses the latest selector', () => {
      //   let selectorId = 0;
      //   let forceRender;
      //
      //   const Comp = () => {
      //     const [, f] = useReducer(c => c + 1, 0);
      //     forceRender = f;
      //     const renderedSelectorId = selectorId++;
      //     const value = useSelector(() => renderedSelectorId);
      //     renderedItems.push(value);
      //     return <div />;
      //   };
      //
      //   rtl.render(
      //     <ProviderMock store={store}>
      //       <Comp />
      //     </ProviderMock>,
      //   );
      //
      //   expect(renderedItems).toEqual([0]);
      //
      //   rtl.act(forceRender);
      //   expect(renderedItems).toEqual([0, 1]);
      //
      //   rtl.act(() => {
      //     store.dispatch({ type: '' });
      //   });
      //   expect(renderedItems).toEqual([0, 1]);
      //
      //   rtl.act(forceRender);
      //   expect(renderedItems).toEqual([0, 1, 2]);
      // });
      //
      // describe('edge cases', () => {
      // it('ignores transient errors in selector (e.g. due to stale props)', () => {
      //   const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      //   const { reduxModule, useSelector } = setup();
      //
      //   const Parent = () => {
      //     const count = useSelector(reduxModule,'countSelector');
      //     return <Child parentCount={count} />;
      //   };
      //
      //   const Child = ({ parentCount }) => {
      //     const result = useSelector(({ count }) => {
      //       if (count !== parentCount) {
      //         throw new Error();
      //       }
      //
      //       return count + parentCount;
      //     });
      //
      //     return <div>{result}</div>;
      //   };
      //
      //   rtl.render(
      //     <ProviderMock store={store}>
      //       <Parent />
      //     </ProviderMock>,
      //   );
      //
      //   expect(() => store.dispatch({ type: '' })).not.toThrowError();
      //
      //   spy.mockRestore();
      // });
      //
      //   it('correlates the subscription callback error with a following error during rendering', () => {
      //     const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      //
      //     const Comp = () => {
      //       const result = useSelector(count => {
      //         if (count > 0) {
      //           throw new Error('foo');
      //         }
      //
      //         return count;
      //       });
      //
      //       useEffect(() => {
      //         console.log('useEffect');
      //
      //         return () => {
      //           console.log('wtf');
      //         };
      //       });
      //
      //       return <div>{result}</div>;
      //     };
      //
      //     const store = createStore((count = -1) => count + 1);
      //
      //     const App = () => (
      //       <ProviderMock store={store}>
      //         <Comp />
      //       </ProviderMock>
      //     );
      //
      //     rtl.render(<App />);
      //
      //     expect(() => store.dispatch({ type: '' })).toThrow(/The error may be correlated/);
      //
      //     spy.mockRestore();
      //   });
      //
      //   it('re-throws errors from the selector that only occur during rendering', () => {
      //     const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      //
      //     const Parent = () => {
      //       const count = useSelector(s => s.count);
      //       return <Child parentCount={count} />;
      //     };
      //
      //     const Child = ({ parentCount }) => {
      //       const result = useSelector(({ count }) => {
      //         if (parentCount > 0) {
      //           throw new Error();
      //         }
      //
      //         return count + parentCount;
      //       });
      //
      //       return <div>{result}</div>;
      //     };
      //
      //     rtl.render(
      //       <ProviderMock store={store}>
      //         <Parent />
      //       </ProviderMock>,
      //     );
      //
      //     expect(() => store.dispatch({ type: '' })).toThrowError();
      //
      //     spy.mockRestore();
      //   });
      //
      //   it('allows dealing with stale props by putting a specific connected component above the hooks component', () => {
      //     const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      //
      //     const Parent = () => {
      //       const count = useSelector(s => s.count);
      //       return <ConnectedWrapper parentCount={count} />;
      //     };
      //
      //     const ConnectedWrapper = connect(({ count }) => ({ count }))(({ parentCount }) => {
      //       return <Child parentCount={parentCount} />;
      //     });
      //
      //     let sawInconsistentState = false;
      //
      //     const Child = ({ parentCount }) => {
      //       const result = useSelector(({ count }) => {
      //         if (count !== parentCount) {
      //           sawInconsistentState = true;
      //         }
      //
      //         return count + parentCount;
      //       });
      //
      //       return <div>{result}</div>;
      //     };
      //
      //     rtl.render(
      //       <ProviderMock store={store}>
      //         <Parent />
      //       </ProviderMock>,
      //     );
      //
      //     store.dispatch({ type: '' });
      //
      //     expect(sawInconsistentState).toBe(false);
      //
      //     spy.mockRestore();
      //   });
      // });
      //
      // describe('error handling for invalid arguments', () => {
      //   it('throws if no selector is passed', () => {
      //     expect(() => useSelector()).toThrow();
      //   });
      // });
    });

    describe('createSelectorHook', () => {
      // let defaultStore;
      // let customStore;
      //
      // beforeEach(() => {
      //   defaultStore = createStore(({ count } = { count: -1 }) => ({
      //     count: count + 1,
      //   }));
      //   customStore = createStore(({ count } = { count: 10 }) => ({
      //     count: count + 2,
      //   }));
      // });
      //
      // it('subscribes to the correct store', () => {
      //   const nestedContext = React.createContext(null);
      //   const useCustomSelector = createSelectorHook(nestedContext);
      //   let defaultCount = null;
      //   let customCount = null;
      //
      //   const getCount = s => s.count;
      //
      //   const DisplayDefaultCount = ({ children = null }) => {
      //     const count = useSelector(getCount);
      //     defaultCount = count;
      //     return <>{children}</>;
      //   };
      //   const DisplayCustomCount = ({ children = null }) => {
      //     const count = useCustomSelector(getCount);
      //     customCount = count;
      //     return <>{children}</>;
      //   };
      //
      //   rtl.render(
      //     <ProviderMock store={defaultStore}>
      //       <ProviderMock context={nestedContext} store={customStore}>
      //         <DisplayCustomCount>
      //           <DisplayDefaultCount />
      //         </DisplayCustomCount>
      //       </ProviderMock>
      //     </ProviderMock>,
      //   );
      //
      //   expect(defaultCount).toBe(0);
      //   expect(customCount).toBe(12);
      // });
    });
  });
});
