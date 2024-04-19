import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { IContainerScopes, InstanceCreationAware } from '../container/IContainer.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { Container } from '../container/Container.js';
import { ClassType } from '../utils/ClassType.js';
import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import {
  assertValidDependency,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { DEFAULT_EAGER_GROUP, getEagerDefinitions } from '../context/eagerDefinitions.js';

export class AsyncDefinitionBuilder<TDeps extends AnyInstanceDefinition<any, any>[], TLifeTime extends LifeTime> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
    private _eagerGroup: boolean,
  ) {
    assertValidDependency(this._lifeTime, this._deps);
  }

  eager() {
    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, true);
  }

  using<TNewDeps extends AnyInstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TNewDeps
  ): AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime> {
    return new AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._eagerGroup,
    );
  }

  define<TValue>(
    fn: (locator: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime>) => TValue | Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime> {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async (context: ContainerContext) => {
        return fn(new Container(context));
      },
      dependencies: this._deps,
    });

    this.appendToEagerGroup(definition);

    return definition;
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = (await Promise.all(
          this._deps.map(context.buildWithStrategy),
        )) as InstancesArray<TDeps>;
        return new cls(...dependenciesInstance);
      },
      dependencies: this._deps,
    });

    this.appendToEagerGroup(definition);

    return definition;
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue | Promise<TValue>) {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = await Promise.all(this._deps.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as InstancesArray<TDeps>));
      },
      dependencies: this._deps,
    });

    this.appendToEagerGroup(definition);

    return definition;
  }

  private appendToEagerGroup<TValue>(definition: AsyncInstanceDefinition<TValue, TLifeTime>) {
    if (this._eagerGroup) {
      getEagerDefinitions().appendAsync(definition);
    }
  }
}

export function usingAsync<TLifeTime extends LifeTime>(strategy: TLifeTime) {
  return <TDeps extends AnyInstanceDefinition<any, any>[]>(
    ...deps: TDeps
  ): AsyncDefinitionBuilder<TDeps, TLifeTime> => {
    return new AsyncDefinitionBuilder<TDeps, TLifeTime>(deps, strategy, false);
  };
}
