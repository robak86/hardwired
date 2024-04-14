import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { IContainerScopes, InstanceCreationAware } from '../container/IContainer.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { Container } from '../container/Container.js';
import { ClassType } from '../utils/ClassType.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { assertValidDependency } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

export class AsyncDefinitionBuilder<TDeps extends AnyInstanceDefinition<any, any>[], TLifeTime extends LifeTime> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
  ) {}

  private _assertValidDependency() {
    assertValidDependency(this._lifeTime, this._deps);
  }

  define<TValue>(
    fn: (locator: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime>) => Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime> {
    return asyncDefinition({
      strategy: this._lifeTime,
      create: async (context: ContainerContext) => {
        return fn(new Container(context));
      },
    });
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    return asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = (await Promise.all(
          this._deps.map(context.buildWithStrategy),
        )) as InstancesArray<TDeps>;
        return new cls(...dependenciesInstance);
      },
    });
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue) {
    assertValidDependency(this._lifeTime, this._deps);

    return asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = await Promise.all(this._deps.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as InstancesArray<TDeps>));
      },
    });
  }

  partial<TRestParams extends any[], TRet>(
    fn: (...args: [...InstancesArray<TDeps>, ...TRestParams]) => TRet,
  ): InstanceDefinition<(...args: TRestParams) => TRet, TLifeTime> {
    this._assertValidDependency();

    return InstanceDefinition.create(this._lifeTime, context =>
      fn.bind(null, ...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>)),
    );
  }
}

export function usingAsync<TLifeTime extends LifeTime>(strategy: TLifeTime) {
  return <TDeps extends AnyInstanceDefinition<any, any>[]>(
    ...deps: TDeps
  ): AsyncDefinitionBuilder<TDeps, TLifeTime> => {
    return new AsyncDefinitionBuilder<TDeps, TLifeTime>(deps, strategy);
  };
}
