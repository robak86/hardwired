import { MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class LifeCycle<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  onInit(
    // key: TKey,
    initFn: (container: MaterializedModuleEntries<TRegistry>) => void,
  ): this {
    return this.build(this.registry.appendInitializer('_____module', initFn));
  }

  protected build(ctx) {
    return new LifeCycle(ctx) as any;
  }
}

export const lifecycle = () => <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): LifeCycle<TRegistry> => new LifeCycle(registry);
