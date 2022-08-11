import { external } from '../external.js';
import { request, singleton, transient } from '../../definitions.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { fn } from '../fn.js';
import { PickExternals } from '../../../utils/PickExternals.js';
import { describe, it, expect, vi } from 'vitest';

describe(`fn`, () => {
  describe(`allowed dependencies life times`, () => {
    const numberConsumer = (val: number) => val;

    const ext = external('number').type<number>();

    describe(`transient`, () => {
      it(`does not accept singletons with externals`, async () => {
        const buildDef = () => {
          const dep = singleton.fn((val: number) => val, ext);

          type WTF = PickExternals<[typeof ext]>;

          // @ts-expect-error transient does not accept singleton dependencies with externals
          fn(LifeTime.transient)(numberConsumer, dep);
        };

        expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
      });

      it(`accepts request def with externals`, async () => {
        const dep = request.fn(val => val, ext);
        fn(LifeTime.transient)(numberConsumer, dep);
      });

      it(`accepts transient with externals`, async () => {
        const dep = transient.fn(val => val, ext);
        fn(LifeTime.transient)(numberConsumer, dep);
      });
    });

    describe(`request`, () => {
      it(`does not accept singletons with externals`, async () => {
        const buildDef = () => {
          const dep = singleton.fn(val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          fn(LifeTime.request)(numberConsumer, dep);
        };

        expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
      });

      it(`accepts request def with externals`, async () => {
        const dep = request.fn(val => val, ext);
        fn(LifeTime.request)(numberConsumer, dep);
      });

      it(`accepts transient with externals`, async () => {
        const dep = transient.fn(val => val, ext);
        fn(LifeTime.request)(numberConsumer, dep);
      });
    });

    describe(`singleton`, () => {
      it(`does not accept singletons with externals`, async () => {
        const buildDef = () => {
          const dep = singleton.fn(val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          fn(LifeTime.singleton)(numberConsumer, dep);
        };

        expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
      });

      it(`does not accept request dependency def with externals`, async () => {
        const buildDef = () => {
          const dep = request.fn(val => val, ext);
          fn(LifeTime.singleton)(numberConsumer, dep);
        };

        expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
      });

      it(`does not accept transient dependency with externals`, async () => {
        const buildDef = () => {
          const dep = transient.fn(val => val, ext);
          fn(LifeTime.singleton)(numberConsumer, dep);
        };
        expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
      });
    });
  });
});
