# Hardwired React

Integration for [Hardwired](https://github.com/robak86/hardwired) and [React](https://reactjs.org/).

## Motivation

[Dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) pattern is one of the
fundamental techniques for writing modular, loosely coupled, and testable code. The pattern is
usually associated with object-oriented programming, where the construction of dependencies'
graph is most often delegated to
the [Inversion of Control Container](https://www.martinfowler.com/articles/injection.html), but
dependency injection is also present in functional programming in the form of partial
application/currying or reader monad.
([Functional approaches to dependency injection](https://fsharpforfunandprofit.com/posts/dependency-injection-1/)
,
[Dealing with complex dependency injection in F#](https://bartoszsypytkowski.com/dealing-with-complex-dependency-injection-in-f/)
,
[Getting started with fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5)
)

Dependency injection is also relevant in React applications. React already provides a
mechanism for dependency injection in the form of
[context](https://beta.reactjs.org/learn/passing-data-deeply-with-context).
This library aims to provide opinionated semantics for defining and injecting
dependencies to the React components (using the service locator pattern).

## Limitations

React context supports basic reactivity / change detection for the state stored in the context, but
it has performance penalties in case of frequent updates. Additionally, container implementation
used by `hardwired` internally uses mutable state that cannot be used with shallow comparison.
Because
of these limitations, `hardwired-react` doesn't provide **observability** features for objects created by
the container. However, observability can be easily enabled by using `MobX` or other libraries
providing similar functionality.

### Installation

The following examples will use `mobx` for enabling observability for objects with observable state.

yarn

```
yarn add hardwired hardwired-react mobx mobx-react
```

npm

```
npm install hardwired hardwired-react mobx mobx-react
```

## Getting started

1. Create implementation and instances definitions

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';

export class CounterStore {
  constructor(public value: number) {
    makeAutoObservable(this);
  }
}

export class CounterActions {
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

For purpose of this example we use `singleton` lifetime. For the detailed explanation of life times,
please refer to hardwired docs
[documentation](https://github.com/robak86/hardwired#definitions-lifetimes)

2. Create components

```typescript jsx
import { useDefinition } from './useDefinition.js';
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
      <Counter />
      <CounterButtons />
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

React components can be tested using both unit and integration oriented approaches.
Without using dependency injection, we are somewhat forced to the latter. Integration tests focus on
testing the component's real, user-facing behavior. They are not burden with testing implementation
details, so in theory they shouldn't be as fragile as unit tests. Unfortunately, in case of complex
components, depending solely on integration tests can be costly because they very often require a
complex setup for every test case. In this section, I will present a more unit-test oriented
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
      apply(counterActionsDef, counterActionsInstance => {
        // setup mocks on counterActionsInstance
        jest.spyOn(counterActionsInstance, 'increment');
        jest.spyOn(counterActionsInstance, 'decrement');
      }),
    ]);

    const result = render(
      <ContainerProvider container={cnt}>
        <CounterButtons />
      </ContainerProvider>,
    );

    return {
      clickIncrementButton: () => {
        const incrementBtn = result.getByRole('button', { name: /increment/i });
        userEvent.click(incrementBtn);
      },
      clickDecrementButton: () => {
        const decrementBtn = result.getByRole('button', { name: /decrement/i });
        userEvent.click(decrementBtn);
      },
      counterActions: cnt.get(counterActionsDef),
    };
  }

  it(`calls correct method on "increment" button click`, async () => {
    const { counterActions, clickIncrementButton } = setup();
    clickIncrementButton();
    expect(counterActions.increment).toBeCalledTimes(1);
  });

  it(`calls correct method on "decrement" button click`, async () => {
    const { counterActions, clickDecrementButton } = setup();
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
    const cnt = container([
      set(counterInitialValueDef, initialValue), // initialValue will be used instead of the
      // original defined by counterInitialValueDef
    ]);

    const result = render(
      <ContainerProvider container={cnt}>
        <Counter />
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
    const { getRenderedValue } = setup(1);
    expect(getRenderedValue()).toEqual('1');
  });

  it(`re-renders on counter value change`, async () => {
    const { getRenderedValue, setCounterValue } = setup(1);
    setCounterValue(200);
    expect(getRenderedValue()).toEqual('200');
  });
});
```

### Implicit dependencies

There are cases, where some objects injected into the component need to be parametrized. (e.g. using
props). For such scenarios hardwired provides `implicit` definitions, for which the values can
be provided at runtime. The following example would enable
adding multiple labeled instances of counters from the getting-started section.

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';
import { external, scoped } from 'hardwired';

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
const counterLabelValueDef = implicit<string>('label');
const counterStoreDef = scoped.class(CounterStore, counterInitialValueDef, counterLabelValueDef);
const counterActionsDef = scoped.class(CounterActions, counterStoreDef);
```

Notice that the lifetime for counter store and counter actions was changed from `singleton` to
`scoped`. Additionally, the counter store takes label parameter that will be passed at
runtime.

```typescript jsx
import { useDefinition, ContainerProvider, ContainerScope, useDefinition, useDefinitions } from 'hardwired-react';
import { set } from 'hardwired';
import { observer } from 'mobx-react';

export const Counter = observer(() => {
  const store = useDefinition(counterStoreDef);
  return (
    <h2>
      Current value: <span data-testid={'counter-value'}>{store.value}</span>
    </h2>
  );
});

export const CounterLabel = observer(() => {
  const store = useDefinition(counterStoreDef);
  return <h2>{store.label}</h2>;
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

export const ComplexLabel = observer(() => {
  return (
    <div>
      <CounterLabel />
      <Counter />
      <CounterButtons actions={actions} />
    </div>
  );
});

export const App = () => {
  return (
    <ContainerProvider>
      <ContainerScope overrides={[set(counterLabelValueDef, 'first counter')]}>
        <ComplexLabel />
      </ContainerScope>

      <ContainerScope
        overrides={[
          set(counterLabelValueDef, 'second counter'), //
          set(counterInitialValueDef, 100),
        ]}
      >
        <ComplexLabel />
      </ContainerScope>
    </ContainerProvider>
  );
};
```

### Discussion

Using the IoC for such a simple case is absolute overkill as the component tree is rather flat.
One could just pass `label` in props for `<ComplexLabel/>` that would propagate this value
`<CounterLabel/>`. This way we could have two instances of the component rendering
different labels. On the other hand, the example illustrates that, thanks to IoC container,
we don't need to force the parent component to know about properties that are only required by the
leaves of the component tree (or distant components). That's why very often `container` components
are the "difficult" ones (comparing to `dummy` components). They aggregate all the dependencies
that are
required by the child components. By delegating this functionality to the IoC container,
we delegate the complexity to the specialised unit, and can keep top-level components simple
and focused on their main responsibility, which is the composition of child components without
necessarily knowing its implementation details. The Presented approach also helps in treating
React components just as view layer (by the analogy to the MVC pattern). Delegating all the business
logic to plain classes becomes easier when we don't have to manually build these objects and can
encapsulate instantiation details within
[definitions](https://github.com/robak86/hardwired#overview).

Unfortunately, this approach is not without flaws.
Fetching dependencies (`useDefinition`) from container creates additional level of
indirection comparing to passing the dependencies via props.

Dependencies fetched by `useDefinition` also create hierarchy(directed acyclic graph)
of objects with their dependencies, that very often do not correspond the hierarchy of the components.
In a lot of cases, this kind of freedom gives big advantage over manual passing deps via props
(especially for data that are shared by many components),
but on the other hand, it hinders the flow of data/dependencies through the hierarchy of the
components.

Using `useDefinition` also introduce coupling between the component and `hardwired` so still
whenever possible one should strive for using `dummy` components as the leaves of components tree.

The easiness of injecting dependencies to the components may also encourage creating a lot of
references between multiple components and instances fetched from the container.
This may complicate reasoning about the code.
However, the issue may be reduced by introducing strict control over mutability of the injected
objects.
Usually the read-only (getters only) objects injected into multiple components don't create
problems.
Uncontrolled mutability with side effects available for multiple consumers is usually the main
source of complexity.

### Definition life times in relation to React components rendering

- each `useDefinition` call gets instances from the closest container scope provided by
  `ContainerProvider` or `ContainerScope` components

```typescript jsx
import { scoped } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let id = 0;
const nextId = () => (id += 1);

const valD = scoped.fn(() => nextId());

const SomeComponent = () => {
  const value1 = useDefinition(valD);
  const value2 = useDefinition(valD);

  // value1 is equal to value2 because component is rendered within a single scope
  return (
    <span>
      {value1}, {value2}
    </span>
  );
};
```

```typescript jsx
import { scoped } from 'hardwired';
import { useDefinition } from 'hardwired-react';
import { ContainerProvider, ContainerScope } from 'hardwired-react/dist/esm';

let id = 0;
const nextId = () => (id += 1);

const valD = scoped.fn(() => nextId());

const SomeComponent = () => {
  const value1 = useDefinition(valD);
  return <span>{value1}</span>;
};

const App = () => {
  return (
    <ContainerProvider>
      <SomeComponent />

      <ContainerScope>
        <SomeComponent />
      </ContainerScope>
      <ContainerScope>
        <SomeComponent />
      </ContainerScope>
    </ContainerProvider>
  );
};

// each component will display different value, because each is wrapped with different container
// scope
```

- singleton instances created by `useDefinition` become globally cached and are available for all
  components wrapped with common `ContainerProvider`.

```typescript jsx
import { singleton } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let id = 0;
const nextId = () => (id += 1);

const valueDef = singleton.fn(nextId); // valueDef is defined as a singleton

const Parent = () => {
  const value = useDefinition(valueDef);

  return (
    <span>
      <Child />
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
import { transient } from 'hardwired';
import { useDefinition } from 'hardwired-react';

let renderCount = 0;
const increaseRenderCount = () => (renderCount += 1);

const valueDef = transient.fn(() => increaseRenderCount()); // valueDef is defined as a transient

const Parent = () => {
  const value = useDefinition(valueDef); // new instance on each re-render

  return (
    <h1>
      Component rendered <span>{value}</span> times
    </h1>
  );
};
```
