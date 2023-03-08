import { implicit, implicitAsync } from 'hardwired';
import { provide, provideAsync, use } from '../use.js';
import { describe, expect, it } from 'vitest';
import { withScope } from '../withScope.js';
import { withContainer } from '../withContainer.js';

describe(`provide`, () => {
  const impl = implicit<number>('someNumber');
  const implAsync = implicitAsync<number>('someNumber');

  describe(`root container`, () => {
    it(`returns correct value`, async () => {
      const result = withContainer(() => {
        provide(impl, 123);
        return use(impl);
      });

      expect(result).toEqual(123);
    });

    it(`can be resolved with async`, async () => {
      const result = await withContainer(async () => {
        provideAsync(implAsync, async () => 123);
        return use(implAsync);
      });

      expect(result).toEqual(123);
    });

    it(`returns correct async value`, async () => {
      const result = await withContainer(async () => {
        provideAsync(implAsync, async () => 123);
        return await use(implAsync);
      });

      expect(result).toEqual(123);
    });

    it(`throws if definition was already instantiated`, async () => {
      const run = () => {
        const result = withContainer(() => {
          provide(impl, 123);
          const instance = use(impl);
          provide(impl, 123);
          return instance;
        });
      };

      expect(run).toThrow();
    });

    it(`allows overriding values until an instance is created`, async () => {
      const result = withContainer(() => {
        provide(impl, 123);
        provide(impl, 456);
        return use(impl);
      });

      expect(result).toEqual(456);
    });
  });

  describe(`child scope`, () => {
    it(`inherits overrides`, async () => {
      const result = withContainer(() => {
        provide(impl, 123);
        return withScope(() => {
          return use(impl);
        });
      });

      expect(result).toEqual(123);
    });

    it(`allows providing a new value for child scope`, async () => {
      const result = withContainer(() => {
        provide(impl, 123);
        return withScope(() => {
          provide(impl, 456);
          return use(impl);
        });
      });

      expect(result).toEqual(456);
    });
  });
});
