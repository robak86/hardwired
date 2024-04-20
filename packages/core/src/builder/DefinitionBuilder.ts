import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ClassType } from '../utils/ClassType.js';
import {
  assertValidDependency,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { IContainerScopes, InstanceCreationAware } from '../container/IContainer.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { Container } from '../container/Container.js';
import { getEagerDefinitions } from '../context/EagerDefinitions.js';
import { AsyncDefinitionBuilder } from './AsyncDefinitionBuilder.js';

export class DefinitionBuilder<
  TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>>[],
  TLifeTime extends LifeTime,
> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
    private _meta: object,
    private _eagerGroup: boolean,
  ) {
    assertValidDependency(this._lifeTime, this._deps);
  }

  async() {
    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, this._meta, this._eagerGroup);
  }

  meta(meta: object) {
    return new DefinitionBuilder(this._deps, this._lifeTime, { ...this._meta, ...meta }, this._eagerGroup);
  }

  using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TNewDeps
  ): DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime> {
    return new DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
      this._eagerGroup,
    );
  }

  eager() {
    return new DefinitionBuilder(this._deps, this._lifeTime, this._meta, true);
  }

  define<TValue>(buildFn: (locator: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime>) => TValue) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      (context: ContainerContext) => {
        return buildFn(new Container(context)); // TODO: still unclear if we should create a new instance of Container
      },
      this._deps,
      this._meta,
    );

    this.appendToEagerGroup(definition);

    return definition;
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      context => new cls(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>)),
      this._deps,
      this._meta,
    );

    this.appendToEagerGroup(definition);

    return definition;
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      context => {
        return factory(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>));
      },
      this._deps,
      this._meta,
    );

    this.appendToEagerGroup(definition);
    return definition;
  }

  private appendToEagerGroup<TValue>(definition: InstanceDefinition<TValue, TLifeTime>) {
    if (this._eagerGroup) {
      getEagerDefinitions().append(definition);
    }
  }
}

export function using<TLifeTime extends LifeTime>(strategy: TLifeTime) {
  return <TDeps extends InstanceDefinition<any, any>[]>(...deps: TDeps): DefinitionBuilder<TDeps, TLifeTime> => {
    return new DefinitionBuilder<TDeps, TLifeTime>(deps, strategy, {}, false);
  };
}
