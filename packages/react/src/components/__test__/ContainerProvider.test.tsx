import { ContainerProvider } from '../ContainerProvider.js';
import { container, fn } from 'hardwired';

import { createContext, useContext } from 'react';
import { use } from '../../hooks/use.js';
import { render } from '@testing-library/react';
import { hook } from '../../definitions/hook.js';
import { expect } from 'vitest';

describe(`ContainerProvider`, () => {
  function setup() {
    const cnt = container.new();
    const SomeContext = createContext({ value: 123 });
    const useSomeContext = vi.fn(() => useContext(SomeContext));

    const hookDef = hook(useSomeContext);
    const otherHookDef = hook(useSomeContext);

    const hookConsumer = fn.singleton(use => {
      return use(hookDef);
    });

    const ChildComponent = () => {
      const consumedHookValue = use(hookConsumer);
      const consumedOtherHookValue = use(otherHookDef);

      return (
        <>
          <h1 data-testid={'value1'}>{consumedHookValue.value}</h1>
          <h1 data-testid={'value2'}>{consumedOtherHookValue.value}</h1>
        </>
      );
    };

    const TestSubject = () => {
      return (
        <ContainerProvider hooks={[hookDef, otherHookDef]}>
          <ChildComponent />
        </ContainerProvider>
      );
    };

    return {
      cnt,
      TestSubject,
      useSomeContext,
    };
  }

  it(`calls hookFn and memorizes it as singleton`, async () => {
    const { TestSubject, useSomeContext } = setup();
    const result = render(<TestSubject />);
    result.rerender(<TestSubject />);

    expect(result.getByTestId('value1').textContent).toEqual('123');
    expect(result.getByTestId('value2').textContent).toEqual('123');

    // called twice, because we use two hooks definitions use the same "useSomeContext" function
    expect(useSomeContext).toHaveBeenCalledTimes(2);
  });
});
