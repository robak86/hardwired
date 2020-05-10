import { module } from '../../module/Module';
import { ModuleBuilder } from '../../builders/ModuleBuilder';
import { Definition, RequiresDefinition } from '../../module/ModuleRegistry';
import { container, DeepGetReturnErrorMessage } from '../Container';
import { expectType, TypeEqual } from 'ts-expect';

describe(`Container`, () => {
  describe(`.deepGet`, () => {
    describe(`types`, () => {
      it(`checks if module passed as an argument is compatible with container externals`, async () => {
        const m1: ModuleBuilder<{ external: RequiresDefinition<{ a: number }>; own: Definition<number> }> = module('');
        const m2: ModuleBuilder<{ other: Definition<number> }> = module('');
        const m3: ModuleBuilder<{
          otherExternal: RequiresDefinition<{ a: number }>;
          other: Definition<number>;
        }> = module('');

        const c = container(m1);
        (c as any).deepGet = () => null;
        const result = c.deepGet(m1, 'own');
        const result2 = c.deepGet(m2, 'other');
        const error = c.deepGet(m3, 'other');

        expectType<TypeEqual<typeof result, number>>(true);
        expectType<TypeEqual<typeof result2, number>>(true);
        expectType<TypeEqual<typeof error, DeepGetReturnErrorMessage>>(true);
      });
    });
  });
});
