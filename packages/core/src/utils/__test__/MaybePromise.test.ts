import { describe, expect, it, vi } from 'vitest';

import { isThenable } from '../IsThenable.js';

import { MaybePromise, maybePromise, maybePromiseAll } from './../MaybePromise.js';

describe('MaybePromise', () => {
  describe('Static Methods', () => {
    describe('of', () => {
      it('should create a MaybePromise with a non-promise value', () => {
        const mp = MaybePromise.of(42);

        expect(mp.get()).toBe(42);
        expect(isThenable(mp.get())).toBe(false);
      });

      it('should create a MaybePromise with a promise value', async () => {
        const promise = Promise.resolve(42);
        const mp = MaybePromise.of(promise);

        expect(mp.get()).toBe(promise);
        expect(isThenable(mp.get())).toBe(true);
        expect(await mp.asPromise()).toBe(42);
      });
    });

    describe('all', () => {
      it('should handle an array of non-promise values', () => {
        const mp = MaybePromise.all([1, 2, 3]);

        expect(mp.get()).toEqual([1, 2, 3]);
        expect(isThenable(mp.get())).toBe(false);
      });

      it('should handle an array with at least one promise value', async () => {
        const values = [1, Promise.resolve(2), 3];
        const mp = MaybePromise.all(values);

        expect(isThenable(mp.get())).toBe(true);
        expect(await mp.asPromise()).toEqual([1, 2, 3]);
      });

      it('should handle an empty array', () => {
        const mp = MaybePromise.all([]);

        expect(mp.get()).toEqual([]);
        expect(isThenable(mp.get())).toBe(false);
      });

      it('should reject if any promise rejects', async () => {
        const error = new Error('Test error');
        const values = [1, Promise.reject(error), 3];
        const mp = MaybePromise.all(values);

        await expect(mp.asPromise()).rejects.toThrow(error);
      });
    });
  });

  describe('Instance Methods', () => {
    describe('map', () => {
      it('should transform non-promise value', () => {
        const mp = MaybePromise.of(42);
        const result = mp.map(x => x * 2);

        expect(result.get()).toBe(84);
        expect(isThenable(result.get())).toBe(false);
      });

      it('should transform promise value', async () => {
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.map(x => x * 2);

        expect(isThenable(result.get())).toBe(true);
        expect(await result.asPromise()).toBe(84);
      });

      it('should handle functions that throw errors for non-promise value', () => {
        const error = new Error('Test error');
        const mp = MaybePromise.of(42);

        expect(() =>
          mp.map(() => {
            throw error;
          }),
        ).toThrow(error);
      });

      it('should handle functions that throw errors for promise value', async () => {
        const error = new Error('Test error');
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.map(() => {
          throw error;
        });

        await expect(result.asPromise()).rejects.toThrow(error);
      });
    });

    describe('flatMap', () => {
      it('should transform non-promise value to non-promise result', () => {
        const mp = MaybePromise.of(42);
        const result = mp.flatMap(x => x * 2);

        expect(result.get()).toBe(84);
        expect(isThenable(result.get())).toBe(false);
      });

      it('should transform non-promise value to promise result', async () => {
        const mp = MaybePromise.of(42);
        const result = mp.flatMap(x => Promise.resolve(x * 2));

        expect(isThenable(result.get())).toBe(true);
        expect(await result.asPromise()).toBe(84);
      });

      it('should transform promise value to non-promise result', async () => {
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.flatMap(x => x * 2);

        expect(isThenable(result.get())).toBe(true);
        expect(await result.asPromise()).toBe(84);
      });

      it('should transform promise value to promise result', async () => {
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.flatMap(x => Promise.resolve(x * 2));

        expect(isThenable(result.get())).toBe(true);
        expect(await result.asPromise()).toBe(84);
      });

      it('should handle rejection in input promise', async () => {
        const error = new Error('Test error');
        const mp = MaybePromise.of(Promise.reject(error));
        const result = mp.flatMap(x => x * 2);

        await expect(result.asPromise()).rejects.toThrow(error);
      });
    });

    describe('tap', () => {
      it('should call the function with non-promise value and return the same instance', () => {
        const spy = vi.fn();
        const mp = MaybePromise.of(42);
        const result = mp.tap(spy);

        expect(spy).toHaveBeenCalledWith(42);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mp);
        expect(result.get()).toBe(42);
      });

      it(`calls callback with a correct type`, async () => {
        maybePromise(Promise.resolve(42)).tap((value: number) => {});
      });

      it('should call the function with resolved promise value', async () => {
        const spy = vi.fn();
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.tap(spy);

        expect(spy).not.toHaveBeenCalled();
        await result.asPromise();
        expect(spy).toHaveBeenCalledWith(42);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should not call the function if promise rejects', async () => {
        const error = new Error('Test error');
        const spy = vi.fn();
        const mp = MaybePromise.of(Promise.reject(error));
        const result = mp.tap(spy);

        try {
          await result.asPromise();
        } catch (e) {
          // Ignore error
        }

        expect(spy).not.toHaveBeenCalled();
      });

      it('should handle functions that throw errors for non-promise value', () => {
        const error = new Error('Test error');
        const mp = MaybePromise.of(42);

        expect(() =>
          mp.tap(() => {
            throw error;
          }),
        ).toThrow(error);
      });

      it('should handle functions that throw errors for promise value', async () => {
        const error = new Error('Tap error');
        const mp = MaybePromise.of(Promise.resolve(42));
        const result = mp.tap(() => {
          throw error;
        });

        await expect(result.asPromise()).rejects.toThrow(error);
      });
    });

    describe('get', () => {
      it('should return the non-promise value', () => {
        const mp = MaybePromise.of(42);

        expect(mp.get()).toBe(42);
      });

      it('should return the promise value', () => {
        const promise = Promise.resolve(42);
        const mp = MaybePromise.of(promise);

        expect(mp.get()).toBe(promise);
      });
    });

    describe('asPromise', () => {
      it('should convert non-promise value to a promise', async () => {
        const mp = MaybePromise.of(42);
        const result = mp.asPromise();

        expect(isThenable(result)).toBe(true);
        expect(await result).toBe(42);
      });

      it('should return the original promise for promise value', async () => {
        const promise = Promise.resolve(42);
        const mp = MaybePromise.of(promise);
        const result = mp.asPromise();

        expect(result).toBe(promise);
        expect(await result).toBe(42);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('maybePromise', () => {
      it('should create a MaybePromise with a non-promise value', () => {
        const mp = maybePromise(42);

        expect(mp.get()).toBe(42);
        expect(isThenable(mp.get())).toBe(false);
      });

      it('should create a MaybePromise with a promise value', async () => {
        const promise = Promise.resolve(42);
        const mp = maybePromise(promise);

        expect(mp.get()).toBe(promise);
        expect(isThenable(mp.get())).toBe(true);
        expect(await mp.asPromise()).toBe(42);
      });
    });

    describe('maybePromiseAll', () => {
      it('should handle an array of non-promise values', () => {
        const mp = maybePromiseAll([1, 2, 3]);

        expect(mp.get()).toEqual([1, 2, 3]);
        expect(isThenable(mp.get())).toBe(false);
      });

      it('should handle an array with at least one promise value', async () => {
        const values = [1, Promise.resolve(2), 3];
        const mp = maybePromiseAll(values);

        expect(isThenable(mp.get())).toBe(true);
        expect(await mp.asPromise()).toEqual([1, 2, 3]);
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should chain multiple operations correctly with non-promise values', () => {
      const result = maybePromise(5)
        .map(x => x * 2)
        .flatMap(x => x + 3)
        .tap(x => expect(x).toBe(13))
        .get();

      expect(result).toBe(13);
    });

    it('should chain multiple operations correctly with promise values', async () => {
      const result = await maybePromise(Promise.resolve(5))
        .map(x => x * 2)
        .flatMap(x => Promise.resolve(x + 3))
        .tap(x => expect(x).toBe(13))
        .asPromise();

      expect(result).toBe(13);
    });

    it('should handle mixed promise and non-promise values in all', async () => {
      const values = [1, Promise.resolve(2), maybePromise(3).get(), maybePromise(Promise.resolve(4)).get()];

      const result = await maybePromiseAll(values).asPromise();

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should maintain promise rejection through the chain', async () => {
      const error = new Error('Test error');
      const chain = maybePromise(Promise.reject(error))
        .map(x => x * 2)
        .flatMap(x => x + 3)
        .tap(x => expect(x).not.toBeCalled());

      await expect(chain.asPromise()).rejects.toThrow(error);
    });
  });
});
