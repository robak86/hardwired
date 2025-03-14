import { DefinitionDisposable } from '../DefinitionDisposable.js';
import { fn } from '../../definitions/definitions.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { InstancesStore } from '../../context/InstancesStore.js';

describe(`DefinitionDisposable`, () => {
  describe(`singletons`, () => {
    describe(`instance exists`, () => {
      it.skip(`calls dispose for singletons`, async () => {
        const disposeSpy = vi.fn();
        const s = fn.singleton(() => 123);

        const bindings = BindingsRegistry.create();
        const instances = InstancesStore.create();

        // instances.upsertIntoGlobalInstances()

        const definitionDisposable = new DefinitionDisposable(s, disposeSpy, bindings, instances);

        definitionDisposable[Symbol.dispose]();

        expect(disposeSpy).toHaveBeenCalledWith(123);
      });
    });
  });
});
