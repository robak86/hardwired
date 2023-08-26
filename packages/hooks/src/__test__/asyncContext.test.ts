import { replace, scoped, value } from 'hardwired';

import { use } from '../use.js';
import { describe, expect, it } from 'vitest';
import { withScope } from '../withScope.js';
import { withContainer } from '../withContainer.js';
import { getContainerId } from '../asyncContainerStorage.js';

describe(`AsyncContext`, () => {
  it(`works`, async () => {
    const someValue = scoped.fn(() => Math.random());

    const result = await withContainer(async () => {
      console.log(getContainerId());
      const collected: number[] = [];

      collected.push(use(someValue));
      collected.push(use(someValue));

      withScope(() => {
        console.log('withScope', getContainerId());
        collected.push(use(someValue));
      });

      await withScope(async () => {
        console.log('withscope2', getContainerId());
        collected.push(use(someValue));
      });
      console.log(getContainerId());

      return collected;
    });

    expect(result[0]).toEqual(result[1]);
    expect(result[1]).not.toEqual(result[2]);
    expect(result[2]).not.toEqual(result[3]);
  });

  it(`works with overrides`, async () => {
    const someValue = scoped.fn(() => 1);

    const result = await withContainer(async () => {
      const collected: number[] = [];

      collected.push(use(someValue));

      withScope(() => collected.push(use(someValue)));

      await withScope([replace(someValue, value(2))], async () => {
        collected.push(use(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(1);
    expect(result[1]).toEqual(1);
    expect(result[2]).toEqual(2);
  });
});
