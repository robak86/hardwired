import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  DefinitionsSet,
  MaterializedModuleEntries,
  ModuleRegistry,
  NotDuplicated,
} from '@hardwired/di';
import { IApplication } from '../types/App';
import { ServerResolver } from '../resolvers/ServerResolver';

export type NextServerBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  ServerModuleBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class ServerModuleBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  app<TKey extends string, TResult extends IApplication>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  app<TKey extends string, TDeps extends any[], TResult extends IApplication>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  app<TKey extends string, TDeps extends any[], TResult extends IApplication>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ServerResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }
}
