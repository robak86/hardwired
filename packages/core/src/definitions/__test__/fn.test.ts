import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';

import { fn } from '../fn.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import { container } from '../../container/Container.js';

describe(`fn`, () => {
  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const def = fn.scoped(() => 123);

      expectType<IDefinition<number, LifeTime.scoped>>(def);
    });

    it(`returns correct type for async fn`, async () => {
      const def = fn.scoped(async () => 123);

      expectType<IDefinition<Promise<number>, LifeTime.scoped>>(def);
    });

    it(`lifts to async`, async () => {
      const def = fn.scoped(async () => 123);
      const consumer = fn.scoped(def, (val: number) => val + 1);

      expectType<IDefinition<Promise<number>, LifeTime.scoped>>(consumer);
    });

    it(`doesn't allow narrower lifetimes for dependencies`, async () => {
      const def = fn.scoped(async () => 123);

      // @ts-expect-error
      fn.singleton(def, (val: number) => val + 1);
    });

    it(`injects correct type`, async () => {
      const myNum = fn.singleton(() => 123);
      const myNumAsync = fn.scoped(async () => 123);

      fn.scoped(myNum, myNumAsync, (val, valFromAsync) => {
        expectType<TypeEqual<number, typeof val>>(true);
        expectType<TypeEqual<number, typeof valFromAsync>>(true);

        return val + 1;
      });
    });
  });

  describe(`resolution`, () => {
    describe(`transient`, () => {
      it(`returns transient definition`, async () => {
        const myFn = fn(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });
    });

    describe(`sync`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = fn.scoped(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });
    });

    describe(`sync`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = fn.scoped(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });

      it(`graph of dependencies`, async () => {
        const myFn = fn.scoped(() => 123);
        const otherFn = fn.scoped(myFn, (val: number) => val + 1);

        expect(container().use(otherFn)).toEqual(124);
      });
    });

    describe(`async`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = fn.scoped(async () => 123);

        expect(await container().use(myFn)).toEqual(123);
      });

      it(`graph of dependencies`, async () => {
        const myFn = fn.scoped(async () => 123);
        const otherFn = fn.scoped(myFn, async (val: number) => val + 1);

        expect(await container().use(otherFn)).toEqual(124);
      });
    });
  });
});
