import type { TypeOf } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe } from 'vitest';

import type { Container } from '../../container/Container.js';
import { container } from '../../container/Container.js';
import type { IContainer } from '../../container/IContainer.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { cascading, scoped } from '../../definitions/def-symbol.js';

describe(`ContainerConfiguration`, () => {
  describe(`container#freeze`, () => {
    it(`allows freezing instances before they are created`, async () => {
      // const def = fn.scoped(() => 123);

      const def = scoped<number>();
      const cnt = container.new();

      cnt.freeze(def).static(456);
      expect(cnt.use(def)).toEqual(456);
    });

    it(`throws if the instances is already created`, async () => {
      const def = scoped<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      await cnt.use(def);

      expect(() => cnt.freeze(def).static(456)).toThrowError('already instantiated');
    });

    it(`works with child scopes`, async () => {
      const def = scoped<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      const scope = cnt.scope();

      scope.freeze(def).static(456);
      expect(scope.use(def)).toEqual(456);
    });

    it(`throws when cascading definition was created in child scope`, async () => {
      const def = cascading<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      const scope1 = cnt.scope(s => s.own(def));

      await scope1.use(def);

      const scope2 = scope1.scope();

      expect(() => scope2.freeze(def).static(456)).toThrowError('already instantiated');
    });
  });

  describe(`container.new`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new(
        async _c => {},
        _c => {},
      );

      expectType<TypeOf<typeof cnt, Promise<Container>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new(_c => {});

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`correctly configures the container`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = await container.new(async container => {
        container.overrideCascading(def).toValue(456);
      });

      expect(cnt.use(def)).toEqual(456);
    });

    it(`accepts multiple config functions`, async () => {
      const def1 = fn.scoped(() => 123);
      const def2 = fn.scoped(() => 123);

      const cnt = await container.new(
        async container => {
          container.overrideCascading(def1).toValue(456);
        },
        async container => {
          container.overrideCascading(def2).toValue(789);
        },
      );

      expect(cnt.use(def1)).toEqual(456);
      expect(cnt.use(def2)).toEqual(789);
    });

    describe(`init`, () => {
      it(`runs init functions on passing the newly created container`, async () => {
        const dep = fn.scoped(() => new BoxedValue(Math.random()));

        const cnt = container.new(container => {
          container.init(use => {
            use(dep).value = 1;
          });
        });

        expect(cnt.use(dep).value).toEqual(1);
      });
    });
  });

  describe(`container.scope`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope(async () => {});

      expectType<TypeOf<typeof scope, Promise<IContainer>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope();

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
        scope.overrideCascading(def).toValue(456);
      });

      expect(scope.use(def)).toEqual(456);
    });

    it(`allows to asynchronously get instance from the parent container`, async () => {
      const fromParent = fn.singleton(async () => 'fromParent');

      const def = fn.scoped(() => 'original');
      const cnt = container.new();
      const scope = await cnt.scope(async (scope, use) => {
        scope.overrideCascading(def).toValue(await use(fromParent));
      });

      expect(scope.use(def)).toEqual('fromParent');
    });
  });

  describe(`container.disposable`, () => {
    it(`correctly configures the scope`, async () => {
      const def = fn.scoped(() => 123);
      const cnt = container.new();
      const scope = await cnt.scope(async scope => {
        scope.overrideCascading(def).toValue(456);
      });

      expect(scope.use(def)).toEqual(456);
    });

    it(`allows to asynchronously get instance from the parent container`, async () => {
      const fromParent = fn.singleton(async () => 'fromParent');

      const def = fn.scoped(() => 'original');
      const cnt = container.new();
      const scope = await cnt.scope(async (scope, use) => {
        scope.overrideCascading(def).toValue(await use(fromParent));
      });

      expect(scope.use(def)).toEqual('fromParent');
    });
  });
});
