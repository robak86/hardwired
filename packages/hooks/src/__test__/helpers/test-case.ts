import type { IContainer } from 'hardwired';
import { container } from 'hardwired';
import { it as itImpl } from '@vitest/runner';

import { withContainer } from '../../asyncContainerStorage.js';

export const it = (testCaseName: string, clbck: (container: IContainer) => unknown) => {
  return itImpl(testCaseName, () => {
    const cnt = container();

    return withContainer(cnt, () => clbck(cnt));
  });
};
