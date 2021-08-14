import {unit} from '../../module/ModuleBuilder';
import {singleton} from '../../strategies/SingletonStrategy';
import {NewContainerContext} from '../../context/NewContainerContext';

describe(`ContainerRecord`, () => {
  describe(`async scope`, () => {
    // it(`acquires "lock" on async resource and returns single instance for all interested parties`, async () => {
    //   const ctx = ContainerContext.empty();
    //   const resourceId = 'someId';
    //   const asyncResourceFactory = () => new Promise(resolve => setTimeout(() => resolve(123), 10));
    //   expect(ctx.hasInAsyncRequestScope(resourceId)).toEqual(false);
    //
    //   const call1 = ctx.usingAsyncScope(resourceId, asyncResourceFactory);
    //   expect(ctx.hasInAsyncRequestScope(resourceId)).toEqual(true);
    //   const value = await call1;
    //   expect(value).toEqual(123);
    // });
  });

  describe(`request scope`, () => {
    // it(`sets value for request scope cache`, async () => {
    //   const ctx = ContainerContext.empty();
    //   const resourceId = 'someId';
    //
    //   expect(ctx.hasInRequestScope(resourceId)).toEqual(false);
    //   expect(ctx.setForRequestScope(resourceId, 123));
    //   expect(ctx.getFromRequestScope(resourceId)).toEqual(123);
    // });
    //
    // it(`does not inherit values from parent request scope`, async () => {
    //   const ctx = ContainerContext.empty();
    //   const resourceId = 'someId';
    //
    //   expect(ctx.setForRequestScope(resourceId, 123));
    //
    //   const childScope = ctx.forNewRequest();
    //   expect(childScope.hasInRequestScope(resourceId)).toEqual(false);
    // });
  });

  describe(`asObject`, () => {
    describe(`modules own definitions`, () => {
      it(`returns materializes module definitions`, async () => {
        const m = unit()
          .define('a', singleton, () => 1)
          .build();
        const context = NewContainerContext.empty();

        const { a } = context.materialize(m);
        expect(a).toEqual(1);
      });

      it.todo(`uses the same request scope for getting all object properties`);
    });

    describe(`getting nested properties`, () => {
      it(`returns materializes module definitions`, async () => {
        const grandChildM = unit()
          .define('grandChildValue1', singleton, () => 1)
          .build();
        const childM = unit()
          .import('grandChild', grandChildM)
          .define('childVal1', singleton, () => 1)
          .build();
        const m = unit()
          .import('child', childM)
          .define('a', singleton, () => 1)
          .build();

        const context = NewContainerContext.empty();

        const materialized = context.materialize(m);
        expect(materialized.child.grandChild.grandChildValue1).toEqual(1);
      });
    });
  });
});
