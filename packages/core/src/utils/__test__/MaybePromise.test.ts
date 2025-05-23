import { describe, expect, it, vi } from 'vitest';

import { MaybePromise } from '../MaybePromise.js';

describe('MaybePromise', () => {
  describe('sync values', () => {
    it('should return the same value via trySync()', () => {
      const mp = new MaybePromise(42);

      expect(mp.trySync()).toBe(42);
    });

    it('should call then synchronously', () => {
      const spy = vi.fn((x: number) => x + 1);
      const mp = new MaybePromise(1).then(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(mp.trySync()).toBe(2);
    });

    it('should catch thrown error in then()', () => {
      const mp = new MaybePromise(10)
        .then(() => {
          throw new Error('fail');
        })
        .catch(e => {
          return 999;
        });

      expect(mp.trySync()).toBe(999);
    });

    it('should run finally synchronously', () => {
      const spy = vi.fn();
      const mp = new MaybePromise('ok').finally(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(mp.trySync()).toBe('ok');
    });
  });

  describe('async values', () => {
    it('should resolve async value correctly with then()', async () => {
      const mp = new MaybePromise(Promise.resolve(5));
      const result = await mp.then(x => x + 5);

      expect(result).toBe(10); // Should throw, not actually sync
    });

    it('should resolve async value correctly with then(), ex.2', async () => {
      const mp = new MaybePromise(5);
      const result = mp.then(x => x + 5);

      expect(result.trySync()).toBe(10); // Should throw, not actually sync
    });

    it('should throw on trySync() when async', () => {
      const mp = new MaybePromise(Promise.resolve(1));

      expect(() => mp.trySync()).toThrowError('Value is asynchronous');
    });

    it('should support async catch()', async () => {
      const err = new Error('fail');
      const mp = new MaybePromise(Promise.reject(err)).catch(e => {
        expect(e).toBe(err);

        return 'handled';
      });

      await expect(Promise.resolve(mp)).resolves.toBe('handled');
    });

    it('should support async finally()', async () => {
      const spy = vi.fn();
      const mp = new MaybePromise(Promise.resolve('done')).finally(spy);
      const result = await mp;

      expect(spy).toHaveBeenCalledOnce();
      expect(result).toBe('done');
    });

    it('should chain async then()', async () => {
      const mp = new MaybePromise(Promise.resolve(2)).then(x => x * 3).then(x => Promise.resolve(x + 1));

      await expect(Promise.resolve(mp)).resolves.toBe(7);
    });
  });

  describe('type preservation', () => {
    it('should preserve type in then()', () => {
      const mp = new MaybePromise('hi').then(x => x + '!');

      expect(mp.trySync()).toBe('hi!');
    });

    it('should allow chaining multiple thens', () => {
      const mp = new MaybePromise(3).then(x => x + 2).then(x => x * 10);

      expect(mp.trySync()).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('should allow null handlers in then()', () => {
      const mp = new MaybePromise(1).then(null);

      expect(mp.trySync()).toBe(1);
    });

    it('should allow null handler in catch() and finally()', () => {
      const mp = new MaybePromise(123).catch(null).finally(null);

      expect(mp.trySync()).toBe(123);
    });

    it('should not mutate original instance', () => {
      const orig = new MaybePromise(10);
      const mapped = orig.then(x => x * 2);

      expect(orig.trySync()).toBe(10);
      expect(mapped.trySync()).toBe(20);
    });
  });
});
