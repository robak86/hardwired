import { describe } from 'vitest';
import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';

import { Definition } from '../Definition.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { container } from '../../../container/Container.js';
import { fn } from '../../fn.js';

describe(`Definition`, () => {
  describe(`$type`, () => {
    it(`returns awaited type`, async () => {
      type Def = typeof def.$type;

      const def = fn(async () => ({
        num: 1,
        str: 'str',
      }));

      type Expected = { num: number; str: string };

      expectType<Expected>(def.$type);
      expectType<TypeEqual<Def, Expected>>(true);
    });
  });

  describe(`params`, () => {
    it(`returns params types`, async () => {
      const def = fn(async (_use, p0: number, p1: string, p2: boolean, p3: boolean[], p4: string[], p5: number[]) => ({
        p1,
        p2,
        p3,
        p4,
        p5,
      }));

      expectType<number>(def.$p0);
      expectType<string>(def.$p1);
      expectType<boolean>(def.$p2);
      expectType<boolean[]>(def.$p3);
      expectType<string[]>(def.$p4);
      expectType<number[]>(def.$p5);
    });
  });

  describe(`bind`, () => {
    it(`binds to some container ignoring the one passed to create`, async () => {
      const createSpy = vi.fn();
      const def = new Definition(Symbol(), LifeTime.scoped, createSpy);

      const cnt1 = container.new();
      const cnt2 = container.new();

      const bound = def.bindToContainer(cnt1);

      bound.create(cnt2);

      expect(createSpy).toBeCalledWith(cnt1);
    });
  });

  describe(`name`, () => {
    describe('named function', () => {
      it(`returns name of the factory function`, async () => {
        const def = new Definition(Symbol(), LifeTime.scoped, function MyFactory() {});

        expect(def.name).toBe('MyFactory');
      });
    });
  });
});
