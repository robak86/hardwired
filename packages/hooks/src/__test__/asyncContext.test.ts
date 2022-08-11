import { replace, scoped, value } from 'hardwired';
import { withContainer, withRequest, withScope } from '../withContainer.js';
import { useDefinition } from '../useDefinition.js';
import { describe, expect, it } from 'vitest';

describe(`AsyncContext`, () => {
  it(`works`, async () => {
    const someValue = scoped.fn(() => Math.random());
    const result = await withContainer(async () => {
      const collected: number[] = [];

      collected.push(useDefinition(someValue));

      withRequest(() => {
        collected.push(useDefinition(someValue));
      });

      await withScope(async () => {
        collected.push(useDefinition(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(result[1]);
    expect(result[1]).not.toEqual(result[2]);
  });

  it(`works with overrides`, async () => {
    const someValue = scoped.fn(() => 1);

    const result = await withContainer(async () => {
      const collected: number[] = [];

      collected.push(useDefinition(someValue));

      withRequest(() => collected.push(useDefinition(someValue)));

      await withScope([replace(someValue, value(2))], async () => {
        collected.push(useDefinition(someValue));
      });

      return collected;
    });

    expect(result[0]).toEqual(1);
    expect(result[1]).toEqual(1);
    expect(result[2]).toEqual(2);
  });
});
