import { ModuleBuilder, ModuleBuilderRegistry } from '../ModuleBuilder';
import { Definition } from '../../module/ModuleRegistry';
import { expectType, TypeEqual } from 'ts-expect';
import { imports } from '../ImportsBuilder';
import { module } from '../../module/Module';

describe(`ImportsBuilder`, () => {
  it(`correctly propagates TRegistry`, async () => {
    const m: ModuleBuilder<{ a: Definition<number> }> = module('someModule') as any;
    const nextModule = m.using(imports);
    expectType<TypeEqual<ModuleBuilderRegistry<typeof nextModule>, { a: Definition<number> }>>(true);
  });
});
