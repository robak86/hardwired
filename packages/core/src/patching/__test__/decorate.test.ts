import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { singleton } from '../../definitions/def-symbol.js';

describe(`decorate`, () => {
  const someValue = singleton<number>('someValue');

  it(`decorates original value`, async () => {
    const c = container.new(c => {
      c.add(someValue).static(1);
      c.override(someValue).decorate(val => val + 1);
    });

    expect(c.use(someValue)).toEqual(2);
  });

  it(`is evaluated with awaited value`, async () => {
    const c = container.new(c => {
      c.add(someValue).fn(async () => 1);
      c.override(someValue).decorate(val => val + 1);
    });

    expect(await c.use(someValue)).toEqual(2);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = singleton<number>();
    const b = singleton<number>();
    const someValue = singleton<number>();

    const c = container.new(c => {
      c.add(a).static(1);
      c.add(b).static(2);
      c.add(someValue).fn(async () => 10);

      c.override(someValue).decorate([a, b], (val, aVal, bVal) => {
        return val + aVal + bVal;
      });
    });

    expect(await c.use(someValue)).toEqual(13);
  });
});
