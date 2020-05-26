import { DefinitionsSet, ModuleRegistry, BaseModuleBuilder } from '@hardwired/di';

export class CommonBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

}
