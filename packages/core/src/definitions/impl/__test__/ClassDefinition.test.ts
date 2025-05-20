import { vi } from 'vitest';

import { ClassDefinition } from '../ClassDefinition.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { container } from '../../../container/Container.js';

describe(`ClassDefinition`, () => {
  describe(`bindToContainer`, () => {
    it(`binds to container ignoring the one passed to create`, async () => {
      const def = new ClassDefinition(Symbol(), LifeTime.scoped, class {}, []);

      const unused = container.new();
      const cnt1 = container.new();
      const cnt2 = container.new();

      vi.spyOn(unused, 'buildWithStrategy');
      vi.spyOn(cnt1, 'buildWithStrategy');
      vi.spyOn(cnt2, 'buildWithStrategy');

      const bound = def.bindToContainer(cnt1);

      await bound.create(unused);

      expect(unused.buildWithStrategy).not.toBeCalled();
      expect(cnt1.buildWithStrategy).toHaveBeenCalledTimes(1);

      const boundAgain = bound.bindToContainer(cnt2);

      await boundAgain.create(unused);

      expect(unused.buildWithStrategy).not.toBeCalled();
      // TODO: this is not correct, we should not call it again
      // on the other hand that means we eagerly instantiate all the cascading instances in upper containers, which might be good?
      expect(cnt1.buildWithStrategy).toHaveBeenCalledTimes(2);
      expect(cnt2.buildWithStrategy).toHaveBeenCalledTimes(1);
    });
  });
});
