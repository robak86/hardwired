import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { singleton } from '../../definitions/tokens.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe(`configure`, () => {
  const someValue = singleton.token<BoxedValue<number>>('someValue');
  const someValueAsync = singleton.token<Promise<BoxedValue<number>>>('someValue');

  it(`decorates original value`, async () => {
    const c = container(c => {
      c.add(someValue).static(new BoxedValue(1));
      c.modify(someValue).configure(val => {
        val.value = 10;
      });
    });

    expect(c.use(someValue).value).toEqual(10);
  });

  it(`is evaluated with awaited value`, async () => {
    const c = container(c => {
      c.add(someValueAsync).fn(async () => new BoxedValue(1));
      c.modify(someValueAsync).configure(val => {
        val.value = 10;
      });
    });

    expect((await c.use(someValueAsync)).value).toEqual(10);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = singleton.token<BoxedValue<number>>();
    const b = singleton.token<BoxedValue<number>>();
    const someValue = singleton.token<BoxedValue<number>>();

    const c = container(c => {
      c.add(a).fn(() => new BoxedValue(1));
      c.add(b).static(new BoxedValue(2));
      c.add(someValue).fn(() => new BoxedValue(10));

      c.modify(someValue)
        .using(a, b)
        .configure((val, aVal, bVal) => {
          val.value = val.value + aVal.value + bVal.value;
        });
    });

    expect(c.use(someValue).value).toEqual(13);
  });
});
