import { implicit } from '../../sync/implicit.js';
import { singleton } from '../../definitions.js';
import { asyncFn } from '../asyncFn.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { value } from '../../sync/value.js';
import { container } from '../../../container/Container.js';
import { describe, expect, it } from 'vitest';

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

  describe(`allowed dependencies life times`, () => {
    const numberConsumer = async (val: number) => val;

    const implDef = implicit<number>('ext1');

    describe(`singleton`, () => {
      describe(`compile-time`, () => {
        it(`does not accept implicit definitions`, async () => {
          try {
            // @ts-expect-error request does not accept implicit definitions
            const dep = asyncFn(LifeTime.singleton)(numberConsumer, implDef);
          } catch (err) {}
        });
      });

      describe(`runtime`, () => {
        it(`does not accept implicit definitions`, async () => {
          const buildDef = () => {
            // @ts-expect-error singleton does not accept implicit definitions
            asyncFn(LifeTime.singleton)(numberConsumer, implDef);
          };

          expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
        });
      });
    });
  });
});
