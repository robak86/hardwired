import { Definition, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { NotDuplicated } from '../module/ModuleUtils';
import { Thunk, unwrapThunk } from '../utils/thunk';
import { ModuleBuilder } from './ModuleBuilder';
import { FunctionModuleBuilder } from './FunctionBuilder';

type NextImportsModuleBuilder<
  TKey extends string,
  TReturn extends ModuleRegistry,
  TRegistry extends ModuleRegistry
> = NotDuplicated<
  TKey,
  TRegistry,
  ImportsModuleBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: ModuleBuilder<TReturn> })]: (TRegistry &
        { [K in TKey]: ModuleBuilder<TReturn> })[K];
    }
  >
>;

export class ImportsModuleBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  import<TKey extends string, TImportedR extends ModuleRegistry>(
    key: TKey,
    mod2: Thunk<ModuleBuilder<TImportedR>>,
  ): NextImportsModuleBuilder<TKey, TImportedR, TRegistry> {
    return this.build(this.registry.extendImports(key, unwrapThunk(mod2).registry)) as any;
  }

  protected build<TNextBuilder>(ctx): TNextBuilder {
    return new ImportsModuleBuilder(ctx) as any;
  }
}

export const imports = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): ImportsModuleBuilder<TRegistry> => {
  return new ImportsModuleBuilder(registry);
};
