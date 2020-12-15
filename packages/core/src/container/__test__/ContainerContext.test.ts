import { ContainerContext } from '../ContainerContext';

describe(`ContainerContext`, () => {
  describe(`async scope`, () => {
    it(`acquires "lock" on async resource and returns single instance for all interested parties`, async () => {
      const ctx = ContainerContext.empty();
      const resourceId = 'someId';
      const asyncResourceFactory = () => new Promise(resolve => setTimeout(() => resolve(123), 10));
      expect(ctx.hasInAsyncRequestScope(resourceId)).toEqual(false);

      const call1 = ctx.usingAsyncScope(resourceId, asyncResourceFactory);
      expect(ctx.hasInAsyncRequestScope(resourceId)).toEqual(true);
      const value = await call1;
      expect(value).toEqual(123);
    });
  });

  describe(`request scope`, () => {
    it(`sets value for request scope cache`, async () => {
      const ctx = ContainerContext.empty();
      const resourceId = 'someId';

      expect(ctx.hasInRequestScope(resourceId)).toEqual(false);
      expect(ctx.setForRequestScope(resourceId, 123))
      expect(ctx.getFromRequestScope(resourceId)).toEqual(123);
    });

    it(`does not inherit values from parent request scope`, async () => {
      const ctx = ContainerContext.empty();
      const resourceId = 'someId';


      expect(ctx.setForRequestScope(resourceId, 123))

      const childScope = ctx.forNewRequest();
      expect(childScope.hasInRequestScope(resourceId)).toEqual(false);
    });
  });
});
