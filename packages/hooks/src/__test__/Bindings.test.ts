import { describe, expect, it } from 'vitest';

import { implicit } from 'hardwired';

import { use } from '../use.js';
import { Bindings } from '../Bindings.js';
import { withScope } from '../withScope.js';
import { withContainer } from '../withContainer.js';

describe(`Bindings`, () => {
  const fakeRequest = { request: true };
  const impl1 = implicit<number>('some number');
  const asyncImpl1 = implicit<number>('other');

  describe(`valid dependencies factories`, () => {
    it(`applies valid values`, async () => {
      const definitions = Bindings.empty()
        .bind(impl1, () => 123)
        .bindAsync(asyncImpl1, async () => 456);

      const result = await withContainer(async () => {
        const result = await definitions.apply(fakeRequest, {});
        return [use(impl1), use(asyncImpl1)];
      });

      expect(result).toEqual([123, 456]);
    });

    it(`inherits values in child scopes`, async () => {
      const definitions = Bindings.empty()
        .bind(impl1, () => 123)
        .bindAsync(asyncImpl1, async () => 456);

      const result = await withContainer(async () => {
        const result = await definitions.apply(fakeRequest, {});
        return withScope(async () => {
          return [use(impl1), use(asyncImpl1)];
        });
      });

      expect(result).toEqual([123, 456]);
    });
  });

  describe(`factories throwing an error`, () => {
    it(`return error result`, async () => {
      const error = new Error('some error');

      const definitions = Bindings.empty()
        .bind(impl1, () => {
          throw error;
        })
        .bindAsync(asyncImpl1, async () => 456);

      const result = () =>
        withContainer(async () => {
          return definitions.apply(fakeRequest, {});
        });

      await expect(result).rejects.toEqual(error);
    });
  });
});
