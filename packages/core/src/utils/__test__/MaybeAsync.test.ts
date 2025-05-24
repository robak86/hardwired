import { describe, expect, it, vi } from 'vitest';

import { MaybeAsync } from '../MaybeAsync.js';

describe('MaybeAsync', () => {
  describe(`construction`, () => {
    it(`unwraps deeply nested MaybeAsync values`, async () => {
      const mp = MaybeAsync.resolve(MaybeAsync.resolve(MaybeAsync.resolve(42)));

      expect(mp.trySync()).toBe(42);
    });

    it(`unwraps deeply nested async MaybeAsync values`, async () => {
      const mp = MaybeAsync.resolve(MaybeAsync.resolve(MaybeAsync.resolve(Promise.resolve(42))));

      expect(await mp).toBe(42);
    });
  });

  describe('sync values', () => {
    it(`unwraps deeply nested MaybeAsync`, async () => {
      const maybeAsync = MaybeAsync.resolve(1).then(val => {
        return MaybeAsync.resolve(MaybeAsync.resolve(MaybeAsync.resolve(val + 1)));
      });

      expect(maybeAsync.trySync()).toBe(2);
    });

    it(`unwraps deeply nested MaybeAsync`, async () => {
      const maybeAsync = MaybeAsync.resolve(1).then(val => {
        return MaybeAsync.resolve(MaybeAsync.resolve(MaybeAsync.resolve(val + 1))).then(innerVal => innerVal + 1);
      });

      expect(maybeAsync.trySync()).toBe(3);
    });

    it(`unwraps deeply nested MaybeAsync with async`, async () => {
      const maybeAsync = MaybeAsync.resolve(1).then(val => {
        return MaybeAsync.resolve(MaybeAsync.resolve(MaybeAsync.resolve(Promise.resolve(val + 1)))).then(innerVal => {
          return innerVal + 1;
        });
      });

      expect(await maybeAsync).toBe(3);
    });

    it('should return the same value via trySync()', () => {
      const mp = MaybeAsync.resolve(42);

      expect(mp.trySync()).toBe(42);
    });

    it('should call then synchronously', () => {
      const spy = vi.fn((x: number) => x + 1);
      const mp = MaybeAsync.resolve(1).then(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(mp.trySync()).toBe(2);
    });

    it('should catch thrown error in then()', () => {
      const mp = MaybeAsync.resolve(10)
        .then(() => {
          throw new Error('fail');
        })
        .catch(e => 999);

      expect(mp.trySync()).toBe(999);
    });

    it('should unwrap sync inner MaybePromise', () => {
      const mp = MaybeAsync.resolve(10).then(() => MaybeAsync.resolve(100));

      expect(mp.trySync()).toBe(100);
    });

    it('should run finally synchronously', () => {
      const spy = vi.fn();
      const mp = MaybeAsync.resolve('ok').finally(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(mp.trySync()).toBe('ok');
    });
  });

  describe('async values', () => {
    it('should resolve async value correctly with then()', async () => {
      const mp = MaybeAsync.resolve(Promise.resolve(5));
      const result = await mp.then(x => x + 5);

      expect(result).toBe(10); // Should throw, not actually sync
    });

    it('should resolve async value correctly with then(), ex.2', async () => {
      const mp = MaybeAsync.resolve(5);
      const result = mp.then(x => x + 5);

      expect(result.trySync()).toBe(10); // Should throw, not actually sync
    });

    it('should throw on trySync() when async', () => {
      const mp = MaybeAsync.resolve(Promise.resolve(1));

      expect(() => mp.trySync()).toThrowError('Value is asynchronous');
    });

    it('should support async catch()', async () => {
      const err = new Error('fail');
      const mp = MaybeAsync.resolve(Promise.reject(err)).catch(e => {
        expect(e).toBe(err);

        return 'handled';
      });

      await expect(Promise.resolve(mp)).resolves.toBe('handled');
    });

    it('should support async finally()', async () => {
      const spy = vi.fn();
      const mp = MaybeAsync.resolve(Promise.resolve('done')).finally(spy);
      const result = await mp;

      expect(spy).toHaveBeenCalledOnce();
      expect(result).toBe('done');
    });

    it('should chain async then()', async () => {
      const mp = MaybeAsync.resolve(Promise.resolve(2))
        .then(x => x * 3)
        .then(x => Promise.resolve(x + 1));

      await expect(Promise.resolve(mp)).resolves.toBe(7);
    });
  });

  describe('type preservation', () => {
    it('should preserve type in then()', () => {
      const mp = MaybeAsync.resolve('hi').then(x => x + '!');

      expect(mp.trySync()).toBe('hi!');
    });

    it('should allow chaining multiple thens', () => {
      const mp = MaybeAsync.resolve(3)
        .then(x => x + 2)
        .then(x => x * 10);

      expect(mp.trySync()).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('should allow null handler in catch() and finally()', () => {
      const mp = MaybeAsync.resolve(123).catch(null).finally(null);

      expect(mp.trySync()).toBe(123);
    });

    it('should not mutate original instance', () => {
      const orig = MaybeAsync.resolve(10);
      const mapped = orig.then(x => x * 2);

      expect(orig.trySync()).toBe(10);
      expect(mapped.trySync()).toBe(20);
    });
  });

  describe('MaybePromise.all', () => {
    it(`doesnt lift to async when MaybePromise is sync`, async () => {
      const result = MaybeAsync.all([MaybeAsync.resolve(1)]).trySync();

      expect(result).toEqual([1]);
    });

    it(`unwraps deeply nested MaybeAsync`, async () => {
      const result = MaybeAsync.all([MaybeAsync.resolve(MaybeAsync.resolve(1))]).trySync();

      expect(result).toEqual([1]);
    });

    it('should return a sync MaybePromise if all inputs are sync', () => {
      const result = MaybeAsync.all([1, 'two', true] as const);

      expect(result.trySync()).toEqual([1, 'two', true]);
    });

    it('should return an async MaybePromise if any input is a Promise', async () => {
      const result = MaybeAsync.all([1, Promise.resolve('two'), true] as const);

      expect(() => result.trySync()).toThrowError('Value is asynchronous');
      expect(await result).toEqual([1, 'two', true]);
    });

    it('should preserve tuple structure and types', async () => {
      const a = 1;
      const b = Promise.resolve('x');
      const c = true;

      const result = MaybeAsync.all([a, b, c] as const);
      const resolved = await result;

      expect(resolved).toEqual([1, 'x', true]);
      expect(resolved[1].toUpperCase()).toBe('X'); // static type is string
    });

    it('should reject if any input Promise rejects', async () => {
      const error = new Error('fail');
      const result = MaybeAsync.all([1, Promise.reject(error), 3]);

      await expect(Promise.resolve(result)).rejects.toThrow(error);
    });

    it('should resolve an empty tuple to empty array', () => {
      const result = MaybeAsync.all([] as const);

      expect(result.trySync()).toEqual([]);
    });

    it('should handle multiple async inputs', async () => {
      const result = MaybeAsync.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)] as const);

      expect(await result).toEqual([1, 2, 3]);
    });

    it('should preserve the order of results', async () => {
      const slow = new Promise(res => setTimeout(() => res('slow'), 50));
      const fast = Promise.resolve('fast');

      const result = MaybeAsync.all(['first', slow, fast, 'last'] as const);

      const resolved = await result;

      expect(resolved).toEqual(['first', 'slow', 'fast', 'last']);
    });
  });
});
