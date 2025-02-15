# Hardwired React

Integration for [Hardwired](https://github.com/robak86/hardwired) and [React](https://reactjs.org/).

## Table of Contents

- [Hardwired React](#hardwired-react)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
  - [Limitations](#limitations)
  - [Installation](#installation)
  - [Getting started](#getting-started)
  - [Testing](#testing)
    - [State](#state)
    - [Components](#components)
    - [Unbound Dependencies](#unbound-dependencies)
    - [Considerations](#considerations)
    - [Mapping Definition Life Time to the React Components Rendering](#mapping-definition-life-time-to-the-react-components-rendering)
      - [Scoped Lifetime](#scoped-lifetime)
      - [Singleton](#singleton)
      - [Transient](#transient)
  - [Functional API](#functional-api)

## Motivation

[Dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) pattern is one of the
fundamental techniques for writing modular, loosely coupled, and testable code. The pattern is
usually associated with object-oriented programming, where the construction of dependencies'
graph is most often delegated to the [Inversion of Control Container](https://www.martinfowler.com/articles/injection.html), but
dependency injection is also present in functional programming in the form of partial
application/currying or the reader monad.

Relevant resources:

- [Functional approaches to dependency injection](https://fsharpforfunandprofit.com/posts/dependency-injection-1/)
- [Complex dependency injection in F#](https://bartoszsypytkowski.com/dealing-with-complex-dependency-injection-in-f/)
- [Introduction to fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5)

Dependency injection is also relevant in React applications. React already provides a
mechanism for dependency injection in the form of [context](https://beta.reactjs.org/learn/passing-data-deeply-with-context).
This library aims to provide an opinionated semantics for defining and injecting
dependencies to React components.

## Limitations

React context supports basic reactivity/change detection for the state stored within the context, but it incurs performance penalties in the case of frequent updates. Additionally, the container implementation used by Hardwired internally relies on mutable state, which is not compatible with shallow comparisons that React uses for change detection. Due to these limitations, `hardwired-react` does not provide observability features for objects created by the container. However, observability can be easily enabled by using [MobX](https://mobx.js.org/) or other libraries that offer similar functionality.

## Installation

The following examples will use `mobx` for observability.

Depending on your package manager run:

```bash
npm install hardwired hardwired-react mobx mobx-react
yarn add hardwired hardwired-react mobx mobx-react
bun add hardwired hardwired-react mobx mobx-react
```

## Getting started

1. Create the model layer.

> These examples use OOP, but Hardwired also provides support for [functional](#functional-api) programming style.

```typescript
import { makeAutoObservable } from 'mobx';
import { cls, value } from 'hardwired';

const initialValue = value(0);

export class CounterStore {
  static class = cls.singleton(this, initialValue);

  constructor(public value: number) {
    makeAutoObservable(this);
  }
}

export class CounterActions {
  static class = cls.singleton(this, [CounterStore.instance]);

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
```

For purpose of this example we use `singleton` lifetime. For the detailed explanation of life times,
please refer to Hardwired docs
[documentation](https://github.com/robak86/hardwired#lifetimes)

1. Create components

   ```typescript jsx
    import { use } from './use.js';
    import { observer } from 'mobx-react';

    export const Counter = observer(() => {
      const state = use(CounterStore.class);

      return (
        <h2>
          Current value: <span data-testid={'counter-value'}>{state.value}</span>
        </h2>
      );
    });

    export const CounterButtons = observer(() => {
      const actions = use(CounterActions.class);

      return (
        <>
          <button onClick={actions.increment}>Increment</button>
          <button onClick={actions.decrement}>Decrement</button>
        </>
      );
    });
   ```

2. Wrap application with `ContainerProvider`

   ```typescript jsx
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

## Testing

### State

By using plain javascript classes for `CounterStore` and `CounterActions`, they are not coupled to
React and can be tested without using any helpers (like `render` from `@testing-library/react`)
which are required for rendering a component. This separation wouldn't be possible if we would
implement counter as a hook, that stores state using `useState`.

```typescript
import { all, container } from 'hardwired';

describe('CounterAction', () => {
  describe('.increment()', () => {
    // manually creating instances
    it('increments counter state by 1', () => {
      const counterStore = new CounterStore(0);
      const counterStoreActions = new CounterActions(counterStore);
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1);
    });

    // delegating instances construction to the container
    it('increments counter state by 1', () => {
      const [counterStore, counterStoreActions] = all(CounterStore.instance, CounterActions.class);

      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1);
    });

    // delegating instances construction to container and
    // overriding initial value for the counter store
    it('increments counter state by 1', () => {
      const cnt = container.new(container => {
        container.bind(initialValue).toValue(10);
      });
      const [counterStore, counterStoreActions] = cnt.all(CounterStore.instance, CounterActions.class);

      counterStoreActions.increment();
      expect(counterStore.value).toEqual(11);
    });
  });
});
```

### Components

React components can be tested using both unit and integration-oriented approaches. Without using dependency injection, we are somewhat forced to the latter.

Integration tests focus on testing the component's real, user-facing behavior. They are not burdened with testing implementation details, so in theory, they shouldn't be as fragile as unit tests. Unfortunately, in the case of complex components, depending solely on integration tests can be costly because they often require a complex setup for every test case. In this section, I will present a more unit-test-oriented approach. (In a real-world application, one should probably find a good balance between both approaches).

In unit tests for `CounterActions`, we want to check if the correct action methods are called on corresponding button clicks. We are not interested in side effects that are triggered by these methods because this behavior was already tested in the previous [suite](#state).

```typescript jsx
// CounterActions.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container, apply, container } from 'hardwired';
import { ContainerProvider } from 'hardwired-react';

describe('CounterButtons', () => {
  function setup() {

    const cnt = container(container => {
      container.bind(CounterActions.class).configure((_, counterActions) => {
        vi.spyOn(counterActions, 'increment');
        vi.spyOn(counterActions, 'decrement');
      })
    })

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
      counterActions: cnt.use(CounterActions.class),
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

For the `Counter` unit tests we just want to make sure that correct counter value was rendered. Optionally we can also check if the component re-renders on value change.

```typescript jsx
// CounterActions.test.tsx
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Container, container} from 'hardwired';
import {ContainerProvider} from 'hardwired-react';
import {runInAction} from 'mobx';

describe('CounterButtons', () => {
  function setup(startCountValue: number) {
    const cnt = container.new(c => {
      c.bindLocal(initialValue).toValue(startCountValue)
    })

    const result = render(
      <ContainerProvider container={cnt}>
        <Counter/>
      </ContainerProvider>,
    );

    return {
      getRenderedValue: () => {
        return result.getByTestId('counter-value').text;
      },
      setCounterValue: (newValue: number) => {
        const store = cnt.use(CounterStore.class);
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

### Unbound Dependencies

There are cases where some objects injected into the component need to be parameterized (e.g., using
props). For such scenarios, Hardwired provides `unbound` definitions, for which the values can
be provided at runtime. The following example enables
adding multiple labeled instances of counters from the getting-started section.

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';
import { external, scoped, cls } from 'hardwired';

const initialValue = value(0);
const label = unbound<string>();

class CounterStore {
  static class = cls.scoped(this, [initialValue, label]);

  constructor(
    public value: number,
    public label: string,
  ) {
    makeAutoObservable(this);
  }
}

class CounterActions {
  static class = cls.scoped(this, [CounterStore.instance]);

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
```

Notice that the lifetime for counter store and counter actions was changed from `singleton` to
`scoped`. Additionally, the counter store takes label parameter that will be passed at
runtime.

```typescript jsx
import { use, ContainerProvider, ContainerScope } from 'hardwired-react';
import { observer } from 'mobx-react';

export const Counter = observer(() => {
  const store = use(CounterStore.class);
  return (
    <h2>
      Current value: <span data-testid={'counter-value'}>{store.value}</span>
    </h2>
  );
});

export const CounterLabel = observer(() => {
  const store = use(CounterStore.class);
  return <h2>{store.label}</h2>;
});

export const CounterButtons = observer(() => {
  const actions = use(CounterActions.class);

  return (
    <>
      <button onClick={actions.increment}>Increment</button>
      <button onClick={actions.decrement}>Decrement</button>
    </>
  );
});

export const LabeledCounter = observer(() => {
  return (
    <div>
      <CounterLabel />
      <Counter />
      <CounterButtons />
    </div>
  );
});

export const App = () => {
  const scope1 = useScopeConfig(scope => {
    scope.bind(label).toValue('first counter');
  })

  const scope2 = useScopeConfig(scope => {
    scope.bind(label).toValue('second counter');
    scope.bind(initialValue).toValue(100);
  })

  return (
    <ContainerProvider>
      <ContainerScope config={scope1}>
        <LabeledCounter />
      </ContainerScope>

      <ContainerScope config={scope2}>
        <LabeledCounter />
      </ContainerScope>
    </ContainerProvider>
  );
};
```

### Considerations

Using an IoC (Inversion of Control) container for such a simple scenario might seem like overkill, especially when the component structure is straightforward. For instance, one could simply pass a label as a prop to `<LabeledCounter/>`, which then forwards it to `<CounterLabel/>`. This simple approach allows for rendering two instances of the component with different labels.

However, the example demonstrates a key advantage of using an IoC container: it eliminates the need for parent components to be aware of the specific dependencies required by deeper or more distant components in the tree (and they don't need to **prop-drill** them). This is particularly relevant for [container](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) components, which are typically more complex than dummy/presentational components because they manage all the dependencies needed by their child components. By offloading this complexity to an IoC container, we simplify top-level components, allowing them to focus solely on composing their children without getting involved in the intricacies of their implementations. This approach aligns with treating React components primarily as a view layer, akin to the MVC pattern, and facilitates the separation of business logic into plain objects (or functions [using functional style](#functional-api)), simplifying object creation and encapsulation.

Unfortunately, this method has its drawbacks. Retrieving dependencies with `use` introduces an additional layer of indirection compared to direct prop passing. The dependencies managed by `use` form a hierarchy (a directed acyclic graph) that does not usually align 1:1 with the component hierarchy. This flexibility can be advantageous, particularly when sharing data across many components, but it can also obscure the flow of data and dependencies through the component structure.

Furthermore, using `use` ties components more closely to the Hardwired library, which can be restrictive. Where possible, using simpler **dummy/presentational components** as the leaves nodes in the component tree is **preferable**.

The ease of injecting dependencies can also lead to excessive coupling between components and instances retrieved from the container. This can potentially make the code harder to understand. This complexity can be mitigated by enforcing **strict controls over the mutability** of injected objects. Typically, injecting read-only objects into multiple components does not lead to issues. However, **uncontrolled mutability** with side effects that are **accessible to multiple consumers** can introduce significant unpredictability and complexity.

### Mapping Definition Life Time to the React Components Rendering

> Note: the following examples don't use mobx, as they don't mutate any data, so there is no need to rerender.

#### Scoped Lifetime

The values are memoized in the nearest `<ContainerScope>` or `ContainerProvider` up the component tree.
Both components internally hold their own private state for the current scope.

```typescript jsx
import { scoped } from 'hardwired';
import { use, ContainerProvider, ContainerScope } from 'hardwired-react';


const value = scoped.fn(use => Math.random());

const Presenter = () => {
  const _value = use(value);
  return <span>{_value}</span>;
};

const App = () => {
  return (
    <ContainerProvider>
      <Presenter />

      <ContainerScope>
        <Presenter />
      </ContainerScope>
      <ContainerScope>
        <Presenter />
      </ContainerScope>
    </ContainerProvider>
  );
};
```

In this example each `<Presenter/>` component will display different value, because each one is wrapped with a different scope.

#### Singleton

Singleton instances created by `use` become globally cached and are available for all components wrapped with a common `ContainerProvider`.

```typescript jsx
import { singleton } from 'hardwired';
import { use, ContainerProvider, ContainerScope } from 'hardwired-react';

const value = singleton.fn(use => Math.random());

const Parent = () => {
  const _value = use(value);

  return (
    <ContainerScope>
      <Child />
    </ContainerScope>
  );
};

const Child = () => {
  const _value = use(value);

  // value is equal to the value from the Parent
  return <span>{_value}</span>;
};

const App = () => {
  return <ContainerProvider>
    <Parent>
  </ContainerProvider>

}
```

In this example both `<Parent>` and `<Child>` components will get the same value by calling `use(value)` as they are wrapped by common `<ContainerProvider>`

#### Transient

- transient definitions are not supported by the `hardwired-react` library. The transient instances are not memoized, so they would be created on every render.

## Functional API

If you prefer a more functional programming style, the previous counter example can be implemented as follows:

```typescript jsx
import { fn, value } from 'hardwired';
import { use } from 'hardwired-react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

// model
const initialValue = value(0);

const counterStore = fn.singleton(use => {
  return observable({ value: use(initialValue) });
});

const incrementAction = fn.singleton(use => {
  const store = use(counterStore);

  return action(() => (store.value += 1));
});

const decrementAction = fn.singleton(use => {
  const store = use(counterStore);

  return action(() => (store.value -= 1));
});

// view
export const Counter = observer(() => {
  const state = use(counterStore);

  return (
    <h2>
      Current value: <span data-testid={'counter-value'}>{state.value}</span>
    </h2>
  );
});

export const CounterButtons = observer(() => {
  const increment = use(incrementAction);
  const decrement = use(decrementAction);

  return (
    <>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </>
  );
});
```
