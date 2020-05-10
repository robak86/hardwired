import { ModuleBuilder, ModuleBuilderRegistry } from '../ModuleBuilder';
import { Definition } from '../../module/ModuleRegistry';
import { expectType, TypeEqual } from 'ts-expect';
import { imports } from '../ImportsBuilder';

describe(`ImportsBuilder`, () => {
  it(`correctly propagates TRegistry`, async () => {
    const module: ModuleBuilder<{ a: Definition<number> }> = null as any;
    const nextModule = module.using(imports);
    expectType<TypeEqual<ModuleBuilderRegistry<typeof nextModule>, { a: Definition<number> }>>(true);
  });
});
