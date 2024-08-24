import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ClassType } from '../utils/ClassType.js';
import {
  assertValidDependencies,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { IServiceLocator } from '../container/IContainer.js';

import { AsyncDefinitionBuilder } from './AsyncDefinitionBuilder.js';

export class DefinitionBuilder<
  TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[],
  TLifeTime extends LifeTime,
  TMeta,
> {
  constructor(
    protected _deps: TDeps,
    protected _lifeTime: TLifeTime,
    protected _meta: TMeta,
  ) {
    assertValidDependencies(this._lifeTime, this._deps);
  }

  async() {
    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, this._meta);
  }

  using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[]>(
    ...deps: TNewDeps
  ): DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta> {
    return new DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
    );
  }

  define<TValue>(buildFn: (locator: IServiceLocator<TLifeTime>) => TValue) {
    return InstanceDefinition.create(this._lifeTime, buildFn, this._deps, this._meta);
  }

  thunk<TValue>(buildFn: (locator: IServiceLocator<TLifeTime>) => TValue) {
    return InstanceDefinition.create(
      this._lifeTime,
      (context: IServiceLocator) => {
        return () => buildFn(context);
      },
      this._deps,
      this._meta,
    );
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    return InstanceDefinition.create(
      this._lifeTime,
      context => new cls(...(this._deps.map(context.use) as InstancesArray<TDeps>)),
      this._deps,
      this._meta,
    );
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue) {
    return InstanceDefinition.create(
      this._lifeTime,
      context => {
        return factory(...(this._deps.map(context.use) as InstancesArray<TDeps>));
      },
      this._deps,
      this._meta,
    );
  }
}
