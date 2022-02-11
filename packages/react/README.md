# Hardwired React

Integration for [Hardwired](github.com/robak86/hardwired) and [React](https://reactjs.org/).

**Warning: This library is in an alpha stage.**

## Motivation

[Dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) pattern is one of the
fundamental techniques for writing modular, loosely coupled, and testable code. The pattern is
usually associated with object-oriented programming, where the construction of the dependencies
graph is most often delegated to
the [Inversion of Control Container](https://www.martinfowler.com/articles/injection.html).
Dependency injection is also present in functional programming in the form of partial
application/currying or reader monad.
([Functional approaches to dependency injection](https://fsharpforfunandprofit.com/posts/dependency-injection-1/)
,
[Dealing with complex dependency injection in F#](https://bartoszsypytkowski.com/dealing-with-complex-dependency-injection-in-f/)
,
[Getting started with fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5)
)

At last, dependency injection is also relevant in React applications. React already provides a
mechanism for dependency injection in the form of [context](https://reactjs.org/docs/context. html).
Context
was [introduced](https://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/#react-and-contexts)
a long time before `useContext` hook, and it was used by libraries like `react-redux` for providing
dependencies implicitly through a hierarchy of components - in the case of `react-redux` it was an
instance of a redux store (with all subscription-based machinery providing reactivity).

This library aims to provide standard semantics for defining and injecting dependencies to React
components (using service locator style).

## Limitations

React context supports basic reactivity / change detection for the state stored in the context, but
it has performance penalties in case of frequent updates. Additionally, container implementation
used by Hardwired uses mutable state internally that cannot be used with shallow comparison. Because
of these limitations, hardwired-react doesn't provide observability features for objects created by
the container. However, observability can be still easily enabled by using MobX or other libraries
providing similar functionality.

### Installation

The following examples will use `mobx` for enabling observability for objects holding state.

yarn

```
yarn add hardwired hardwired-react mobx mobx-react
```

npm

```
npm install hardwired hardwired-react mobx mobx-react
```

## Getting started

1. Create implementation and DI definitions

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';

class CounterStore {
    constructor(public value: number) {
        makeAutoObservable(this);
    }
}

class CounterActions {
    constructor(private store: CounterStore) {
        makeAutoObservable(this);
    }

    increment = () => {
        this.store.value += 1;
    };

    decrement = () => {
        this.store.value -= 1;
    };
}

// app.di.ts
import { singleton, value } from 'hardwired';

export const counterInitialValueDef = value(0);
export const counterStoreDef = singleton.class(CounterStore, counterInitialValueDef);
export const counterActionsDef = singleton.class(CounterActions, counterStoreDef);
```

For purpose of this example we use `singleton` lifetime. For detailed explanation of life times
please refer to hardwired
[documentation](https://github.com/robak86/hardwired#definitions-lifetimes)

2. Create components

```typescript jsx
import { useDefinition } from './useDefinition';
import { observer } from 'mobx-react';

export const Counter = observer(() => {
    const state = useDefinition(counterStoreDef);

    return (
        <h2>
            Current value: <span data-testid={'counter-value'}>{state.value}</span>
        </h2>
    );
});

export const CounterButtons = observer(() => {
    const actions = useDefinition(counterActionsDef);

    return (
        <>
            <button onClick={actions.increment}>Increment</button>
            <button onClick={actions.decrement}>Decrement</button>
        </>
    );
});
```

3. Wrap application with `ContainerProvider`

```typescript jsx
// App.tsx
import { FC } from 'react';
import { ContainerProvider } from 'hardwired-react';

export const App: FC = () => {
    return (
        <ContainerProvider>
            <Counter/>
            <CounterButtons/>
        </ContainerProvider>
    );
};
```

### Testing

#### Testing state-related code

By using plain javascript classes for `CounterStore` and `ConterActions`, they are not coupled to
React and can be tested without using any helpers (like `render` from `@testing-library/react`)
which are required for rendering a component. This separation wouldn't be possible if we would
implement counter as a hook, that stores state using `useState`.

```typescript
//CounterAction.test.ts
import { container, set } from 'hardwired';

describe('CounterAction', () => {
    describe('.increment()', () => {
        // manually creating instances
        it('increments counter state by 1', () => {
            const counterStore = new CounterStore(0);
            const counterStoreActions = new CounterActions(counterStore);
            counterStoreActions.increment();
            expect(counterStore.value).toEqual(1);
        });

        // delegating instances construction to container
        it('increments counter state by 1', () => {
            const [counterStore, counterStoreActions] = container().getAll(counterStoreDef, counterActionsDef);
            counterStoreActions.increment();
            expect(counterStore.value).toEqual(1);
        });

        // delegating instances construction to container and overriding initial value for counter store
        it('increments counter state by 1', () => {
            const cnt = container([set(counterInitialValueDef, 10)]);
            const [counterStore, counterStoreActions] = cnt.getAll(counterStoreDef, counterActionsDef);
            counterStoreActions.increment();
            expect(counterStore.value).toEqual(11);
        });
    });
});
```

#### Components

React components can be tested using both unit-test and integration-test oriented approaches.
Without using dependency injection, we are somewhat forced to the latter. Integration tests focus on
testing the component's real, user-facing behavior. They are not burden with testing implementation
details, so in theory they shouldn't be as fragile as unit tests. Unfortunately, in case of complex
components, depending solely on integration tests can be costly because they very often require a
complex setup for every test case. In this section I will present more unit-test oriented
approach. (In real-world application, one should probably find a good balance between both
approaches).

In unit tests for `CounterActions`, we want to check if correct action methods are called on
corresponding buttons clicks. We are not interested in side effects, that are triggered by these
methods because this behaviour was already tested in `CounterActions.test.ts` suite.

```typescript jsx
// CounterActions.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container, apply, container } from 'hardwired';
import { ContainerProvider } from 'hardwired-react';

describe('CounterButtons', () => {
    function setup() {
        const cnt = container([
            apply(counterActionsDef, actions => {
                jest.spyOn(actions, 'increment');
                jest.spyOn(actions, 'decrement');
            }),
        ]);

        const result = render(
            <ContainerProvider>
                <CounterButtons/>
            </ContainerProvider>,
        );

        return {
            clickIncrementButton: () => {
                const incrementBtn = result.getByRole('button', {name: /increment/i});
                userEvent.click(incrementBtn);
            },
            clickDecrementButton: () => {
                const decrementBtn = result.getByRole('button', {name: /decrement/i});
                userEvent.click(decrementBtn);
            },
            counterActions: cnt.get(counterActionsDef),
        };
    }

    it(`calls correct method on "increment" button click`, async () => {
        const {counterActions, clickIncrementButton} = setup();
        clickIncrementButton();
        expect(counterActions.increment).toBeCalledTimes(1);
    });

    it(`calls correct method on "decrement" button click`, async () => {
        const {counterActions, clickDecrementButton} = setup();
        clickDecrementButton();
        expect(counterActions.decrement).toBeCalledTimes(1);
    });
});
```

For `Counter` unit tests we just want to make sure that correct counter value was rendered and
component re-renders on value change.

```typescript jsx
// CounterActions.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container, apply, container } from 'hardwired';
import { ContainerProvider } from 'hardwired-react';
import { runInAction } from 'mobx';

describe('CounterButtons', () => {
    function setup(initialValue: number) {
        const cnt = container([set(counterInitialValueDef, initialValue)]);

        const result = render(
            <ContainerProvider>
                <Counter/>
            </ContainerProvider>,
        );

        return {
            getRenderedValue: () => {
                return result.getByTestId('counter-value').text;
            },
            setCounterValue: (newValue: number) => {
                const store = cnt.get(counterStoreDef);
                runInAction(() => {
                    store.value = newValue;
                });
            },
        };
    }

    it(`renders correct value`, async () => {
        const {getRenderedValue} = setup(1);
        expect(getRenderedValue()).toEqual('1');
    });

    it(`re-renders on counter value change`, async () => {
        const {getRenderedValue, setCounterValue} = setup(1);
        setCounterValue(200);
        expect(getRenderedValue()).toEqual('200');
    });
});
```

### Factory

There are cases, where some objects injected to the component need to be parametrized. (e.g. using
props). For such scenarios `useDefinition|useDefinitions` accepts `...rest` argument with external
parameters.
(For detailed explanation of factories and external parameters feature please refer to hardwired
[documentation](https://github.com/robak86/hardwired#factories)). Following example would enable
adding multiple labeled instances of counters from Getting started section.

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';
import { request, external } from 'hardwired';

class CounterStore {
    constructor(public value: number, public label: string) {
        makeAutoObservable(this);
    }
}

class CounterActions {
    constructor(private store: CounterStore) {
        makeAutoObservable(this);
    }

    increment = () => {
        this.store.value += 1;
    };

    decrement = () => {
        this.store.value -= 1;
    };
}

// app.di.ts
import { singleton, value } from 'hardwired';

const counterInitialValueDef = value(0);
const counterLabelValueDef = external<string>();
const counterStoreDef = request.class(CounterStore, counterInitialValueDef, counterLabelValueDef);
const counterActionsDef = request.class(CounterActions, counterStoreDef);
```

Notice that the lifetime for counter store and counter actions was changed from `singleton` to
`request` (Request scope in the context of hardwired react integration means that created instance is
bound to component that requested given definition). Additionally, the counter store takes external
string parameter that will be passed through a factory.

Since hardwired binds request scope definitions to component, we need to introduce new component
that will hold parametrized instances of `CounterStore` and `CounterActions`, and pass them down do
child components as props.

```typescript jsx
import { useDefinition } from './useDefinition';
import { observer } from 'mobx-react';

export const Counter:FC<{store: CounterStore}> = observer(({store}) => {
    return (
        <h2>
            Current value: <span data-testid={'counter-value'}>{store.value}</span>
        </h2>
    );
});

export const CounterButtons:FC<{actions: CounterActions}> = observer(({actions}) => {
    return (
        <>
            <button onClick={actions.increment}>Increment</button>
            <button onClick={actions.decrement}>Decrement</button>
        </>
    );
});

export const LabeledCounter: FC<{ label: string }> = observer(({label}) => {
    const [store, actions] = useDefinitions([counterStoreDef, counterActionsDef], label);

    return (
        <div>
            <h1>{label}</h1>
            <Counter store={store}/>
            <CounterButtons actions={actions}/>
        </div>
    );
});

export const App = () => {
    return (
        <ContainerProvider>
            <LabeledCounter label={'first counter'}/>
            <LabeledCounter label={'second counter'}/>
        </ContainerProvider>
    );
};
```

### Definition life times in relation to React components rendering

- each `useDefinition's` call uses its own request scope

```typescript jsx
import { request } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let id = 0;
const nextId = () => (id += 1);

const valD = request.fn(() => nextId());

const SomeComponent = () => {
    const value1 = useDefinition(valD);
    const value2 = useDefinition(valD);

    // value1 is not equal to value2 because useDefinition uses different request scope for each call
    return (
        <span>
      {value1}, {value2}
    </span>
    );
};
```

- in order to get multiple instances using the same request scope one should use
  `useDefinitions` hook.

```typescript jsx
import { request } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let id = 0;
const nextId = () => (id += 1);

const valueDef = request.fn(nextId);

const SomeComponent = () => {
    const [value1, value2] = useDefinitions(valueDef, valueDef);

    // value1 equals to value2 because useDefinitions used the same request scope for
    // creating/getting "valueDef" instance

    return (
        <span>
      {value1}, {value2}
    </span>
    );
};
```

- singleton instances created by `useDefinition` become globally cached and are available for every
  component

```typescript jsx
import { request } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let id = 0;
const nextId = () => (id += 1);

const valueDef = singleton.fn(nextId); // valueDef is now singleton

const Parent = () => {
    const value = useDefinition(valueDef);

    return (
        <span>
      <Child/>
    </span>
    );
};

const Child = () => {
    const value = useDefinition(valueDef);

    // value is equal to value from Parent
    return <span>{value1}</span>;
};
```

- transient instances are created on each component rerender

```typescript jsx
import { request } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let renderCount = 0;
const increaseRenderCount = () => (renderCount += 1);

const valueDef = transient.fn(() => increaseRenderCount()); // valueDef is now transient

const Parent = () => {
    const value = useDefinition(valueDef); // new instance on each re-render
  
    return (
        <h1>
            Component rendered <span>{value}</span> times
        </h1>
    );
};
```
