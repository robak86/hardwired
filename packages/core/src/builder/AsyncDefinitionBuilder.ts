import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { IServiceLocator } from '../container/IContainer.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ClassType } from '../utils/ClassType.js';
import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import {
  assertValidDependencies,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

export class AsyncDefinitionBuilder<
  TDeps extends AnyInstanceDefinition<any, any, any>[],
  TLifeTime extends LifeTime,
  TMeta,
> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
    private _meta: TMeta,
  ) {
    assertValidDependencies(this._lifeTime, this._deps);
  }

  using<TNewDeps extends AnyInstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, TMeta>[]>(
    ...deps: TNewDeps
  ): AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta> {
    return new AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
    );
  }

  define<TValue>(
    fn: (locator: IServiceLocator<TLifeTime>) => TValue | Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime, TMeta> {
    return asyncDefinition({
      strategy: this._lifeTime,
      create: async (context: IServiceLocator) => {
        return fn(context);
      },
      dependencies: this._deps,
      meta: this._meta,
    });
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    return asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = (await Promise.all(this._deps.map(context.use))) as InstancesArray<TDeps>;
        return new cls(...dependenciesInstance);
      },
      dependencies: this._deps,
      meta: this._meta,
    });
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue | Promise<TValue>) {
    return asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = await Promise.all(this._deps.map(context.use));
        return factory(...(dependenciesInstance as InstancesArray<TDeps>));
      },
      dependencies: this._deps,
      meta: this._meta,
    });
  }
}
