# Hardwired React

Integration for [Hardwired](github.com/robak86/hardwired) and [React](https://reactjs.org/).
**It currently supports only functional components.**

## Motivation

[Dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) pattern is one of the
fundamental techniques for writing modular, loosely coupled and testable code. The pattern is
usually associated with object-oriented programming, where construction of dependencies graph is
most often delegated
to [Inversion of Control Container](https://www.martinfowler.com/articles/injection.html).
Dependency injection is also present in functional programming in form of partial
application/currying or reader monad.
([Functional approaches to dependency injection](https://fsharpforfunandprofit.com/posts/dependency-injection-1/)
,
[Dealing with complex dependency injection in F#](https://bartoszsypytkowski.com/dealing-with-complex-dependency-injection-in-f/)
,
[Getting started with fp-ts: Reader](https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5)
)

At last, dependency injection is also relevant in React applications. React already provides
mechanism for dependency injection in form of [context](https://reactjs.org/docs/context.html).
Context
was [introduced](https://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/#react-and-contexts)
a long time before `useContext` hook, and it was used by libraries like `react-redux` for providing
dependencies implicitly through hierarchy of components - in case of `react-redux` it was an
instance of a redux store.

The goal of this library is to provide common semantics for defining and injecting dependencies to
React components (using service locator style).

## Limitations

React context supports basic reactivity / change detection for the state stored in the context, but
it has performance penalties in case of frequent updates. This for example forced authors of
react-redux to [switch back](https://github.com/reduxjs/react-redux/releases/tag/v7.0.1) to
subscription based change detection. Additionally, container implementation used
by [Hardwired](github.com/robak86/hardwired) uses internally mutable state which cannot be used with
shallow comparison. Because of these limitations `hardwired-react` doesn't provide observability
features for objects created by the container. However, observability could be easily enabled by
using [MobX](https://mobx.js.org/README.html) or other libraries providing similar functionality.

### Installation

Following examples will use `mobx` for enabling observability for classes holding state.

yarn

```
yarn add hardwired hardwired-react mobx mobx-react
```

npm

```
npm install hardwired hardwired-react mobx mobx-react
```

## Getting started

1. Create implementation and definitions

```typescript
// counter.ts
import { makeAutoObservable } from 'mobx';

class CounterStore {
  constructor(public value: number) {
    makeAutoObservable(this)
  }
}

class CounterActions {
  constructor(private store: CounterStore) {
    makeAutoObservable(this)
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

const counterInitialValueDef = value(0)
const counterStoreDef = singleton.class(CounterStore, counterInitialValueDef);
const counterActionsDef = singleton.class(CounterActions, counterStoreDef);
```

2. Create components

```typescript jsx
import { useDefinition } from './useDefinition';
import { observer } from 'mobx-react';

export const Counter = observer(() => {
  const state = useDefinition(counterStoreDef);

  return <h2>Current value: <span data-testid={'counter-value'}>{state.value}</span></h2>
})

export const CounterButtons = observer(() => {
  const actions = useDefinition(counterActionsDef);

  return <>
    <button onClick={actions.increment}>Increment</button>
    <button onClick={actions.decrement}>Decrement</button>
  </>
})
```

3. Wrap application with `ContainerProvider`

```typescript jsx
// App.tsx
import { FC } from 'react';
import { ContainerProvider } from 'hardwired-react';

export const App: FC = () => {
  return <ContainerProvider>
    <Counter />
    <CounterButtons />
  </ContainerProvider>
}
```

### Testing

#### Testing state related code

By using plain javascript classes for `CounterStore` and `ConterActions`, they are not coupled to
React and can be tested without using any helpers (like `render` from `@testing-library/react`)
which are required for rendering a component. This separation wouldn't be possible if we would
implement counter as a hook, that stores state using `useState`.

```typescript
//CounterAction.test.ts
import { container, set } from 'hardwired'

describe("CounterAction", () => {
  describe(".increment()", () => {
    // manually creating instances
    it("increments counter state by 1", () => {
      const counterStore = new CounterStore(0);
      const counterStoreActions = new CounterStoreActions(counterStore);
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1)
    })

    // delegating instances construction to container
    it("increments counter state by 1", () => {
      const [counterStore, counterStoreActions] = container().getAll(counterStoreDef, counterActionsDef)
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1)
    })

    // delegating instances construction to container and overriding initial value for counter
    it("increments counter state by 1", () => {
      const cnt = container([set(counterInitialValueDef, 10)]);
      const [counterStore, counterStoreActions] = cnt.getAll(counterStoreDef, counterActionsDef)
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(11)
    })
  })
})
```

#### Components

React components can be tested using both unit-test and integration-test oriented approaches.
Without using dependency injection we are somewhat forced to the latter. Integration tests are more
focused on testing the real, user-facing behaviour of the component. They are not burden with
testing implementation details, so in theory they shouldn't be as fragile as unit tests.
Unfortunately in case of complex components, depending solely on integration tests can be costly,
because they very often require complex setup for every test case. In this section I will
demonstrate unit-test oriented approach. (In real world application one should probably find a good
balance between both approaches).

In unit tests for ```CounterActions``` we just want to check if correct action methods are called on
corresponding buttons clicks. We are not interested what side effects are triggered by these methods

- this behaviour was already tested in `CounterActions.test.ts` suite.

```typescript jsx
// CounterActions.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Container, apply, container } from 'hardwired'
import { ContainerProvider } from 'hardwired-react'

describe('CounterButtons', () => {
  function setup() {
    const cnt = container(apply(counterActionsDef, actions => {
      jest.spyOn(actions, 'increment')
      jest.spyOn(actions, 'decrement')
    }))

    const result = render(
      <ContainerProvider>
        <CounterButtons />
      </ContainerProvider>
    )

    return {
      clickIncrementButton: () => {
        const incrementBtn = result.getByRole('button', { name: /increment/i })
        userEvent.click(incrementBtn)
      },
      clickDecrementButton: () => {
        const decrementBtn = result.getByRole('button', { name: /decrement/i })
        userEvent.click(decrementBtn)
      },
      counterActions: cnt.get(counterActionsDef)
    }
  }


  it(`calls correct method on "increment" button click`, async () => {
    const { counterActions, clickIncrementButton } = setup()
    clickIncrementButton();
    expect(counterActions.increment).toBeCalledTimes(1)
  });

  it(`calls correct method on "decrement" button click`, async () => {
    const { counterActions, clickDecrementButton } = setup()
    clickDecrementButton();
    expect(counterActions.decrement).toBeCalledTimes(1)
  });
})
```

For `Counter` component unit tests we just want to make sure that correct counter value was rendered
and component re-renders on value change.

```typescript jsx
// CounterActions.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Container, apply, container } from 'hardwired'
import { ContainerProvider } from 'hardwired-react'
import { runInAction } from 'mobx';

describe('CounterButtons', () => {
  function setup(initialValue: number) {
    const cnt = container(set(counterInitialValueDef, initialValue));

    const result = render(
      <ContainerProvider>
        <Counter />
      </ContainerProvider>
    )

    return {
      getRenderedValue: () => {
        return result.getByTestId('counter-value').text
      },
      setCounterValue: (newValue: number) => {
        const store = cnt.get(counterStoreDef)
        runInAction(() => {
          store.value = newValue
        })
      },
    }
  }


  it(`renders correct value`, async () => {
    const { getRenderedValue } = setup(123)
    expect(getRenderedValue()).toEqual('123')
  });

  it(`re-renders on counter value change`, async () => {
    const { getRenderedValue, setCounterValue } = setup(123)
    setCounterValue(456)
    expect(getRenderedValue()).toEqual('456')
  });
})
```
