# Hardwired React

Hardwired React is an integration library that combines the advanced dependency injection features of [Hardwired](https://github.com/robak86/hardwired) with [React](https://react.dev).
It provides an opinionated semantics for defining and injecting dependencies into React components.

## Table of Contents

- [Hardwired React](#hardwired-react)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
  - [Limitations](#limitations)
  - [Installation](#installation)
  - [Getting started](#getting-started)
    - [1. Create the Model](#1-create-the-model)
    - [2. Create the Components](#2-create-the-components)
    - [3. Wrap the application with `ContainerProvider`](#3-wrap-the-application-with-containerprovider)
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

[Dependency injection (DI)](https://en.wikipedia.org/wiki/Dependency_injection) is a fundamental design pattern for writing modular, loosely coupled, and testable code. While DI is commonly associated with object-oriented programming and [inversion of control (IoC) containers](https://www.martinfowler.com/articles/injection.html), it is also applicable in functional programming through techniques like partial application/currying and the reader monad.

React already provides a basic mechanism for dependency injection via its context feature. However, Hardwired React aims to provide a more structured and opinionated approach to defining and injecting dependencies in React components.
By leveraging the power of Hardwired's IoC container, Hardwired React allows you to:

- Centralize the creation and lifetime management of your application's dependencies
- Decouple components from their dependencies, making them more reusable and testable
- Share dependencies across multiple components without prop drilling
- Encapsulate complex dependency graphs and simplify component composition

If you are familiar with DI in other languages/frameworks or want to bring more structure to your React app's dependency management, Hardwired React is worth exploring.

Relevant resources:

- [Functional approaches to dependency injection](https://fsharpforfunandprofit.com/posts/dependency-injection-1/)
- [Complex dependency injection in F#](https://bartoszsypytkowski.com/dealing-with-complex-dependency-injection-in-f/)
- [Introduction to fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5)

## Limitations

While React's context API supports basic reactivity for state stored within the context, frequent updates can lead to performance penalties. Additionally, Hardwired's container implementation relies on mutable state internally, which is incompatible with the shallow comparisons used by React for change detection.
Due to these limitations, Hardwired React does not provide built-in observability for objects created by the container. However, this functionality can be easily added by leveraging libraries like [MobX](https://mobx.js.org/).

## Installation

To get started, you'll need to install Hardwired React along with its peer dependencies. The examples in this guide will use MobX for observability.

Depending on your package manager run:

```bash
npm install hardwired hardwired-react mobx mobx-react
yarn add hardwired hardwired-react mobx mobx-react
bun add hardwired hardwired-react mobx mobx-react
```

## Getting started

Let's walk through a simple counter example to see Hardwired React in action. We'll start by defining the state and actions in our model layer.

### 1. Create the Model

We'll define a `CounterStore` class to hold the counter state and a `CounterActions` class to encapsulate the increment/decrement logic. Note the use of the `cls` and `value` functions for binding definitions.

> These examples use OOP, but Hardwired also provides support for more [functional](#functional-api) oriented approach.

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

These classes use the singleton lifetime, which means a single instance will be shared across the entire application. See the [Hardwired docs](https://github.com/robak86/hardwired#lifetimes) for more details on available lifetime options.

### 2. Create the Components

Next, we'll create the React components that will use the counter state and actions. The use function allows us to inject the dependencies, while `observer` from `mobx-react` makes the components reactive.

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

### 3. Wrap the application with `ContainerProvider`

Finally, we need to wrap our application with the ContainerProvider component. This sets up the Hardwired container and makes the dependencies available to child components.

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

One of the key benefits of dependency injection is improved testability. Let's see how we can unit test our counter example.

### State

By defining `CounterStore` and `CounterActions` as plain classes, we can test the counter logic independent of React. This wouldn't be possible if we had defined the counter as a hook with `useState`.

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

These tests showcase different ways to create instances for testing - manually creating test subjects, using the default container for getting instances, and using a custom bindings to override default values.

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

For the `Counter` unit tests we just want to make sure that correct counter value was rendered. As an exercise we can also check if the component re-renders on value change.

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
      c.bind(initialValue).toValue(startCountValue)
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

In some cases, you may need to parameterize the dependencies injected into a component, such as when using props. Hardwired supports this via [unbound definitions](https://github.com/robak86/hardwired#unbound-definitions).

Let's extend our counter example to support multiple labeled counter instances:

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

The key changes:

- The `CounterStore` and `CounterActions` now use the scoped lifetime so each ContainerScope can have its own instances.
- An unbound label dependency is defined, which will be provided at runtime.

Here's how the components look with this setup:

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

const scope1 = useScopeConfig(scope => {
  scope.bind(label).toValue('first counter');
})

const scope2 = useScopeConfig(scope => {
  scope.bind(label).toValue('second counter');
  scope.bind(initialValue).toValue(100);
})

export const App = () => {
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

By wrapping each `<LabeledCounter />` in its own `<ContainerScope>` with a specific label value, we can render multiple independent counters on the same page. This avoids the need to manually thread the label prop through the component hierarchy.

### Considerations

Using an IoC (Inversion of Control) container for such a simple scenario might seem like overkill, especially when the component structure is straightforward. For instance, one could simply pass a label as a prop to `<LabeledCounter/>`, which then forwards it to `<CounterLabel/>`. This simple approach allows for rendering two instances of the component with different labels.

However, the example demonstrates a key advantage of using an IoC container. It eliminates the need for parent components to be aware of the specific dependencies required by deeper or more distant components in the tree avoiding **prop-drilling**. This is particularly relevant for [container](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) components, which are typically more complex than dummy/presentational components because they manage all the dependencies needed by their child components. By offloading this complexity to separate classes through IoC container, we simplify top-level components, allowing them to focus solely on composing their children without getting involved in the intricacies of their implementations. This approach aligns with treating React components primarily as a view layer, akin to the MVC pattern, and facilitates the separation of business logic into plain objects (or functions [using functional style](#functional-api)), simplifying object creation and encapsulation.

Unfortunately, this method has its drawbacks. Retrieving dependencies with `use` introduces an additional layer of indirection compared to direct prop passing. The dependencies managed by `use` form a hierarchy (a directed acyclic graph) that does not usually align 1:1 with the component hierarchy. This flexibility can be advantageous, particularly when sharing data across many components, but it can also obscure the flow of data and dependencies through the component structure.

Furthermore, using `use` ties components more closely to the Hardwired library, which can be restrictive. Where possible, using simpler **dummy/presentational components** as the leaves nodes in the component tree is **preferable**.

The ease of injecting dependencies can also lead to excessive coupling between components and instances retrieved from the container. This can potentially make the code harder to understand. This complexity can be mitigated by enforcing **strict controls over the mutability** of injected objects. Typically, injecting read-only objects into multiple components does not lead to issues. However, **uncontrolled mutability** with side effects that are **accessible to multiple consumers** can introduce significant unpredictability and complexity.

## Mapping Definition Life Time to the React Components Rendering

### Scoped Lifetime

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

### Singleton

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

### Transient

- Isn't supported for the React components.

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
