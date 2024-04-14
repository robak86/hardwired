import { replace, scoped, value } from 'hardwired';

import { use } from '../use.js';
import { describe, expect, it } from 'vitest';
import { withScope } from '../withScope.js';
import { withLocalContainer } from '../withLocalContainer.js';

describe(`AsyncContext`, () => {
  it(`works`, async () => {
    const someValue = scoped.fn(() => Math.random());

    const result = await withLocalContainer(async () => {
      const collected: number[] = [];

      collected.push(use(someValue));
      collected.push(use(someValue));

      withScope(() => {
        collected.push(use(someValue));
      });

      await withScope(async () => {
        collected.push(use(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(result[1]);
    expect(result[1]).not.toEqual(result[2]);
    expect(result[2]).not.toEqual(result[3]);
  });

  it(`works with overrides`, async () => {
    const someValue = scoped.fn(() => 1);

    const result = await withLocalContainer(async () => {
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
