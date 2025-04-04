import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';

import type { DerivedLifeTime } from '../derivedLifeTime.js';
import { derivedLifeTime } from '../derivedLifeTime.js';
import { LifeTime } from '../../abstract/LifeTime.js';

describe(`DerivedLifeTime`, () => {
  describe('derivedLifeTime', () => {
    it('returns transient when only transient is provided', () => {
      expect(derivedLifeTime([LifeTime.transient])).toBe(LifeTime.transient);
    });

    it('returns scoped when only scoped is provided', () => {
      expect(derivedLifeTime([LifeTime.scoped])).toBe(LifeTime.scoped);
    });

    it('returns singleton when only singleton is provided', () => {
      expect(derivedLifeTime([LifeTime.singleton])).toBe(LifeTime.singleton);
    });

    it('returns transient when both transient and scoped are provided', () => {
      expect(derivedLifeTime([LifeTime.transient, LifeTime.scoped])).toBe(LifeTime.transient);
    });

    it('returns transient when transient and singleton are provided', () => {
      expect(derivedLifeTime([LifeTime.singleton, LifeTime.transient])).toBe(LifeTime.transient);
    });

    it('returns transient when all lifetimes are provided', () => {
      expect(derivedLifeTime([LifeTime.singleton, LifeTime.scoped, LifeTime.transient])).toBe(LifeTime.transient);
    });

    it('returns scoped when scoped and singleton are provided (no transient)', () => {
      expect(derivedLifeTime([LifeTime.scoped, LifeTime.singleton])).toBe(LifeTime.scoped);
    });

    it('returns singleton when only singleton is provided multiple times', () => {
      expect(derivedLifeTime([LifeTime.singleton, LifeTime.singleton])).toBe(LifeTime.singleton);
    });

    it('return transient for empty array', () => {
      expect(derivedLifeTime([])).toEqual(LifeTime.transient);
    });

    it('throws error for invalid input (not a LifeTime value)', () => {
      expect(() => derivedLifeTime(['invalid' as LifeTime])).toThrow('Invalid lifeTimes array');
    });
  });

  describe(`types`, () => {
    describe(`no lifetimes`, () => {
      it(`returns transient`, async () => {
        type Actual = DerivedLifeTime<never>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`only singleton`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.singleton>;

        expectType<TypeEqual<Actual, LifeTime.singleton>>(true);
      });
    });

    describe(`only transient`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.transient>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`only scoped`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.transient>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`scoped + transient + singleton`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.transient | LifeTime.scoped | LifeTime.singleton>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`scoped + transient`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.transient | LifeTime.scoped>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`transient + singleton`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.transient | LifeTime.singleton>;

        expectType<TypeEqual<Actual, LifeTime.transient>>(true);
      });
    });

    describe(`scoped + singleton`, () => {
      it(`returns correct type`, async () => {
        type Actual = DerivedLifeTime<LifeTime.singleton | LifeTime.scoped>;

        expectType<TypeEqual<Actual, LifeTime.scoped>>(true);
      });
    });
  });
});
