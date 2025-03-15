import type { TypeOf } from 'ts-expect';
import { expectType } from 'ts-expect';

import type { Container } from '../../container/Container.js';
import { container } from '../../container/Container.js';
import type { IContainer } from '../../container/IContainer.js';
import { fn } from '../../definitions/fn.js';

describe(`ContainerConfiguration`, () => {
  describe(`container.new`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new(
        async c => {},
        c => {},
      );

      expectType<TypeOf<typeof cnt, Promise<Container>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new(c => {});

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`correctly configures the container`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = await container.new(async container => {
        container.bindCascading(def).toValue(456);
      });

      expect(cnt.use(def)).toEqual(456);
    });

    it(`accepts multiple config functions`, async () => {
      const def1 = fn.scoped(() => 123);
      const def2 = fn.scoped(() => 123);

      const cnt = await container.new(
        async container => {
          container.bindCascading(def1).toValue(456);
        },
        async container => {
          container.bindCascading(def2).toValue(789);
        },
      );

      expect(cnt.use(def1)).toEqual(456);
      expect(cnt.use(def2)).toEqual(789);
    });
  });

  describe(`container.scope`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope(async c => {});

      expectType<TypeOf<typeof scope, Promise<IContainer>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope(c => {});

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();
      const scope = cnt.scope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`correctly configures the scope`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = container.new();
      const scope = await cnt.scope(async scope => {
        scope.bindCascading(def).toValue(456);
      });

      expect(scope.use(def)).toEqual(456);
    });

    it(`allows to asynchronously get instance from the parent container`, async () => {
      const fromParent = fn.singleton(async use => 'fromParent');

      const def = fn.scoped(() => 'original');
      const cnt = container.new();
      const scope = await cnt.scope(async (scope, use) => {
        scope.bindCascading(def).toValue(await use(fromParent));
      });

      expect(scope.use(def)).toEqual('fromParent');
    });
  });

  describe(`container.disposable`, () => {
    it(`correctly configures the scope`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = container.new();
      const scope = await cnt.scope(async scope => {
        scope.bindCascading(def).toValue(456);
      });

      expect(scope.use(def)).toEqual(456);
    });

    it(`allows to asynchronously get instance from the parent container`, async () => {
      const fromParent = fn.singleton(async use => 'fromParent');

      const def = fn.scoped(() => 'original');
      const cnt = container.new();
      const scope = await cnt.scope(async (scope, use) => {
        scope.bindCascading(def).toValue(await use(fromParent));
      });

      expect(scope.use(def)).toEqual('fromParent');
    });
  });
});
