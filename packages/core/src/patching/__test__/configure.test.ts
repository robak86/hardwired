import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { singleton } from '../../definitions/def-symbol.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe(`configure`, () => {
  const someValue = singleton<BoxedValue<number>>('someValue');

  it(`decorates original value`, async () => {
    const c = container.new(c => {
      c.add(someValue).static(new BoxedValue(1));
      c.modify(someValue).configure(val => {
        val.value = 10;
      });
    });

    expect((await c.use(someValue)).value).toEqual(10);
  });

  it(`is evaluated with awaited value`, async () => {
    const c = container.new(c => {
      c.add(someValue).fn(async () => new BoxedValue(1));
      c.modify(someValue).configure(val => {
        val.value = 10;
      });
    });

    expect((await c.use(someValue)).value).toEqual(10);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = singleton<BoxedValue<number>>();
    const b = singleton<BoxedValue<number>>();
    const someValue = singleton<BoxedValue<number>>();

    const c = container.new(c => {
      c.add(a).fn(async () => new BoxedValue(1));
      c.add(b).static(new BoxedValue(2));
      c.add(someValue).fn(async () => new BoxedValue(10));

      c.modify(someValue).configure([a, b], (val, aVal, bVal) => {
        val.value = val.value + aVal.value + bVal.value;
      });
    });

    expect((await c.use(someValue)).value).toEqual(13);
  });
});
