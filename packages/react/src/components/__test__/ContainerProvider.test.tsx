import { container } from 'hardwired';
import { createContext, useContext } from 'react';
import { render } from '@testing-library/react';
import { expect } from 'vitest';

import { use } from '../../hooks/use.js';
import { hook } from '../../definitions/hook.js';
import { ContainerProvider } from '../ContainerProvider.js';

describe(`ContainerProvider`, () => {
  function setup() {
    const cnt = container.new();
    const SomeContext = createContext({ someNumberValue: 123 });
    const useSomeContext = vi.fn(() => useContext(SomeContext));

    const hookDef = hook(useSomeContext);
    const otherHookDef = hook(useSomeContext);

    const hookConsumer = fn.singleton(use => {
      return use(hookDef);
    });

    // const hookConsumer = singleton

    const ChildComponent = () => {
      const consumedHookValue = use(hookConsumer);
      const consumedOtherHookValue = use(otherHookDef);

      return (
        <>
          <h1 data-testid={'value1'}>{consumedHookValue.use().someNumberValue}</h1>
          <h1 data-testid={'value2'}>{consumedOtherHookValue.use().someNumberValue}</h1>
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

    expect(useSomeContext).toHaveBeenCalledTimes(2); // calls all registered hooks on every rerender

    result.rerender(<TestSubject />);

    expect(result.getByTestId('value1').textContent).toEqual('123');
    expect(result.getByTestId('value2').textContent).toEqual('123');

    expect(useSomeContext).toHaveBeenCalledTimes(4); // calls all registered hooks on every rerender
  });
});
