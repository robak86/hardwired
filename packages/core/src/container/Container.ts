import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { ContainerContext } from '../context/ContainerContext';

export type ChildScopeOptions = {
  scopeOverrides?: ModulePatch<any>[];
};

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  get id(): string {
    return this.containerContext.id;
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(moduleInstance, name);
  }

  getWithSelector<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(this.containerContext.checkoutRequestScope());
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
  }

  asObjectMany<TModule extends Module<any>, TModules extends [TModule, ...TModule[]]>(
    ...modules: TModules
  ): Module.MaterializedArray<TModules> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return modules.map(module => {
      return requestContext.materialize(module);
    }) as any;
  }

  /***
   * New container inherits current's container scopeOverrides, e.g. if current container has overrides for some singleton
   * then new scope will inherit this singleton unless one provides new overrides in options for this singleton.
   * Current containers' instances build by "scoped" strategy are not inherited
   * @param options
   */
  checkoutScope(options: ChildScopeOptions = {}): Container {
    return new Container(this.containerContext.childScope(options));
  }
}

export type ContainerOptions = {
  context?: ContainerContext;
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: ModulePatch<any>[]; // used only in descendent scopes (can be overridden)
  globalOverrides?: ModulePatch<any>[]; // propagated to whole dependencies graph
};

export function container({ context, scopeOverrides = [], globalOverrides = [] }: ContainerOptions = {}): Container {
  const container = new Container(context || ContainerContext.create(scopeOverrides, globalOverrides));
  return container as any;
}
