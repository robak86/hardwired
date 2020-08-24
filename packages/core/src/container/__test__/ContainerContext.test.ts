import { ContainerContext } from '../ContainerContext';

describe(`ContainerContext`, () => {
  describe(`async scope`, () => {
    it(`acquires "lock" on async resource and returns single instance for all interested parties`, async () => {
      const ctx = ContainerContext.empty();
      const resourceId = 'someId';
      const asyncResourceFactory = () => new Promise(resolve => setTimeout(() => resolve(123), 100));
      expect(ctx.hasInAsyncRequestScope(resourceId)).toEqual(false);

      const call1 = ctx.usingAsyncScope(resourceId, asyncResourceFactory);
      expect(ctx.hasInAsyncRequestScope(resourceId));
      const value = await call1;
      expect(value).toEqual(123);
    });
  });
});
