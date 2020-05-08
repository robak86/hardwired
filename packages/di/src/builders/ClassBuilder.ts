import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { Definition, MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { ClassType } from '../module/ModuleUtils';

export class ClassBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): ClassBuilder<TRegistry & { [K in TKey]: Definition<TResult> }>;
  define<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): ClassBuilder<TRegistry & { [K in TKey]: Definition<TResult> }>;
  define<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): ClassBuilder<TRegistry & { [K in TKey]: Definition<TResult> }> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new GlobalSingletonResolver(container => {
        const selectDeps = depSelect ? depSelect : () => [];
        return new klass(...(selectDeps(container as any) as any));
      }),
    );

    return new ClassBuilder(newRegistry) as any;
  }

  protected build<TNextBuilder>(ctx): TNextBuilder {
    return new ClassBuilder(ctx) as any;
  }
}

export const classInstance = <TRegistry extends ModuleRegistry>(registry: DefinitionsSet<TRegistry>) =>
  new ClassBuilder(registry);
