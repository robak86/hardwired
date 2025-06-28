import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';

import type { IDefinition } from '../abstract/IDefinition.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import { container } from '../../container/Container.js';
import { scoped, singleton, transient } from '../tokens.js';

describe(`fn`, () => {
  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const def = scoped.fn(() => 123);

      expectType<IDefinition<number, LifeTime.scoped>>(def);
    });

    it(`returns correct type for async fn`, async () => {
      const def = scoped.fn(async () => 123);

      expectType<IDefinition<Promise<number>, LifeTime.scoped>>(def);
    });

    it(`lifts to async`, async () => {
      const def = scoped.fn(async () => 123);
      const consumer = scoped.using(def).fn((val: number) => val + 1);

      expectType<IDefinition<Promise<number>, LifeTime.scoped>>(consumer);
    });

    it(`doesn't allow narrower lifetimes for dependencies`, async () => {
      const def = scoped.fn(async () => 123);

      // @ts-expect-error
      singleton.using(def).fn((val: number) => val + 1);
    });

    it(`injects correct type`, async () => {
      const myNum = singleton.fn(() => 123);
      const myNumAsync = scoped.fn(async () => 123);

      scoped.using(myNum, myNumAsync).fn((val, valFromAsync) => {
        expectType<TypeEqual<number, typeof val>>(true);
        expectType<TypeEqual<number, typeof valFromAsync>>(true);

        return val + 1;
      });
    });
  });

  describe(`resolution`, () => {
    describe(`transient`, () => {
      it(`returns transient definition`, async () => {
        const myFn = transient.fn(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });
    });

    describe(`sync`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = scoped.fn(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });
    });

    describe(`sync`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = scoped.fn(() => 123);

        expect(container().use(myFn)).toEqual(123);
      });

      it(`graph of dependencies`, async () => {
        const myFn = scoped.fn(() => 123);
        const otherFn = scoped.using(myFn).fn((val: number) => val + 1);

        expect(container().use(otherFn)).toEqual(124);
      });
    });

    describe(`async`, () => {
      it(`resolves correctly values`, async () => {
        const myFn = scoped.fn(async () => 123);

        expect(await container().use(myFn)).toEqual(123);
      });

      it(`graph of dependencies`, async () => {
        const myFn = scoped.fn(async () => 123);
        const otherFn = scoped.using(myFn).fn(async (val: number) => val + 1);

        expect(await container().use(otherFn)).toEqual(124);
      });
    });
  });
});
