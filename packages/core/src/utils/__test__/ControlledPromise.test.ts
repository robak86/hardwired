import { ControlledPromise } from '../ControlledPromise';

describe(`ControlledPromise`, () => {
  it(`resolves with pushed value`, async () => {
    const promise = new ControlledPromise<number>();
    setTimeout(() => promise.resolve(123), 100);
    const result = await promise;
    expect(result).toEqual(123);
  });

  describe(`synchronous call`, () => {
    it(`resolves with pushed value`, async () => {
      const promise = new ControlledPromise<number>();
      promise.resolve(123);
      await expect(promise).resolves.toEqual(123);
    });
  });

  describe(`errors handling`, () => {
    it(`works with try catch`, async () => {
      const promise = new ControlledPromise<number>();
      setTimeout(() => promise.reject({ someError: 'error' }), 100);
      await expect(promise).rejects.toEqual({ someError: 'error' });
    });
  });
});
