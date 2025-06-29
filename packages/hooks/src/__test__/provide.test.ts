import { describe, expect } from 'vitest';
import { scoped } from 'hardwired';

import { use } from '../use.js';
import { withScope } from '../withScope.js';
import { freeze } from '../freeze.js';

import { it } from './helpers/test-case.js';

describe(`freeze`, () => {
  const impl = scoped.token<number>('someNumber');

  describe(`root container`, () => {
    it(`returns correct value`, async () => {
      freeze(impl).static(123);

      const result = withScope(() => {
        return use(impl);
      });

      expect(await result).toEqual(123);
    });
  });
});
