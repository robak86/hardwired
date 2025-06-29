import { configureScope, container, scoped } from 'hardwired';
import { describe, expect } from 'vitest';

import { use } from '../use.js';
import { withScope } from '../withScope.js';
import { withContainer } from '../asyncContainerStorage.js';

import { it } from './helpers/test-case.js';

describe(`AsyncContext`, () => {
  it(`works`, async () => {
    const someValue = scoped.token<Promise<number>>('someValue');

    const cnt = container(c => {
      c.add(someValue).fn(async () => Math.random());
    });

    const result = await withContainer(cnt, async () => {
      const collected: number[] = [];

      collected.push(await use(someValue));
      collected.push(await use(someValue));

      await withScope(async () => {
        collected.push(await use(someValue));
      });

      await withScope(async () => {
        collected.push(await use(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(result[1]);
    expect(result[1]).not.toEqual(result[2]);
    expect(result[2]).not.toEqual(result[3]);
  });

  it(`works with overrides`, async () => {
    const someValue = scoped.token<number>();

    const cnt = container(c => {
      c.add(someValue).fn(() => 1);
    });

    const result = await withContainer(cnt, async () => {
      const collected: number[] = [];

      collected.push(await use(someValue));

      await withScope(async () => collected.push(await use(someValue)));

      const scopeConfig = configureScope(c => {
        c.add(someValue).static(2);
      });

      await withScope(scopeConfig, async () => {
        collected.push(await use(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(1);
    expect(result[1]).toEqual(1);
    expect(result[2]).toEqual(2);
  });
});
