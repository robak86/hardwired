import { container } from '../../container/Container.js';
import { expectType, TypeOf } from 'ts-expect';
import { IContainer } from '../../container/IContainer.js';
import { fn } from '../../definitions/definitions.js';

describe(`ContainerConfiguration`, () => {
  describe(`container.new`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new(async c => {});
      expectType<TypeOf<typeof cnt, Promise<IContainer>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new(c => {});
      expectType<TypeOf<typeof cnt, IContainer>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();
      expectType<TypeOf<typeof cnt, IContainer>>(true);
    });

    it(`correctly configures the container`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = await container.new(async container => {
        container.bindCascading(def).toValue(456);
      });

      expect(cnt.use(def)).toEqual(456);
    });
  });

  describe(`container.checkoutScope`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.checkoutScope(async c => {});

      expectType<TypeOf<typeof scope, Promise<IContainer>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.checkoutScope(c => {});

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();
      const scope = cnt.checkoutScope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`correctly configures the scope`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = container.new();
      const scope = await cnt.checkoutScope(async scope => {
        scope.bindCascading(def).toValue(456);
      });

      expect(scope.use(def)).toEqual(456);
    });

    it(`allows to asynchronously get instance from the parent container`, async () => {
      const fromParent = fn.singleton(async use => 'fromParent');

      const def = fn.scoped(() => 'original');
      const cnt = container.new();
      const scope = await cnt.checkoutScope(async (scope, use) => {
        scope.bindCascading(def).toValue(await use(fromParent));
      });

      expect(scope.use(def)).toEqual('fromParent');
    });
  });

  describe(`container.withScope`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new();
      const value = cnt.withScope(
        async c => {},
        () => {
          return 123;
        },
      );

      expectType<TypeOf<typeof value, Promise<number>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new();
      const value = cnt.withScope(
        c => {},
        () => {
          return 123;
        },
      );

      expectType<TypeOf<typeof value, number>>(true);
    });

    it(`returns value synchronously when no configuration is passed`, async () => {
      const cnt = container.new();
      const value = cnt.withScope(() => 123);

      expectType<TypeOf<typeof value, number>>(true);
    });

    it(`correctly configures the scope`, async () => {
      const def = fn.scoped(() => 123);

      const cnt = container.new();
      const value = await cnt.withScope(
        async scope => {
          scope.bindCascading(def).toValue(456);
        },
        use => {
          return use(def);
        },
      );

      expect(value).toEqual(456);
    });
  });
});
