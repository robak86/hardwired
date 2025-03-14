import { test } from 'vitest';

import type { IContainer } from '../IContainer.js';
import { container } from '../Container.js';

export const withContainer = () => {
  return test.extend<{ use: IContainer }>({
    use: async ({}, use: any) => {
      // const cnt = container.new();

      // const cnt = new WeakRef(container.new());
      //
      // cnt.deref().scope();

      await use(container.new());
    },
  });
};
