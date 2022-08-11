import { external } from '../../sync/external.js';
import { request, singleton, transient } from '../../definitions.js';
import { asyncFn } from '../asyncFn.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { asyncPartial } from '../asyncPartial.js';
import { value } from '../../sync/value.js';
import { container } from '../../../container/Container.js';
import { describe, it, expect } from 'vitest';


describe(`asyncFn`, () => {
  describe(`instantiate`, () => {
    it(`returns correct value`, async () => {
      const fn = async (p1: number) => async (p2: string) => async () => [p1, p2] as const;
      const p1Def = value(1);
      const p2Def = value('str');

      const fnDef = singleton.asyncPartial(fn, p1Def, p2Def);
      const result = await container().getAsync(fnDef);
      expect(await result()).toEqual([1, 'str']);
    });

    it(`returns correct value, ex.2`, async () => {
      const fn = async (p1: number) => async () => async (p2: string) => [p1, p2] as const;
      const p1Def = value(1);
      const p2Def = value('str');

      const fnDef = singleton.asyncPartial(fn, p1Def, p2Def);
      const result = await container().getAsync(fnDef);
      expect(await result()).toEqual([1, 'str']);
    });
  });

  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const ext = external('ext1').type<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncPartial(LifeTime.transient)(numberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });
      });

      describe(`request`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncPartial(LifeTime.request)(numberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });
      });

      describe(`singleton`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error singleton does not accept singleton dependencies with externals
            asyncPartial(LifeTime.singleton)(numberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });
      });
    });
  });
});
