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

import { AsyncDefinitionBuilder } from './AsyncDefinitionBuilder.js';
import { DefinitionAnnotation } from '../eager/EagerDefinitionsInterceptor.js';

export class DefinitionBuilder<
  TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>>[],
  TLifeTime extends LifeTime,
> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
    private _meta: object,
    private _annotations: DefinitionAnnotation<InstanceDefinition<TLifeTime, any>>[],
  ) {
    assertValidDependency(this._lifeTime, this._deps);
  }

  async() {
    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, this._meta, []);
  }

  annotate(metaOrAnnotator: object | DefinitionAnnotation<InstanceDefinition<TLifeTime, any>>) {
    if (typeof metaOrAnnotator === 'function') {
      return new DefinitionBuilder(this._deps, this._lifeTime, this._meta, [
        ...this._annotations,
        metaOrAnnotator as DefinitionAnnotation<InstanceDefinition<TLifeTime, any>>,
      ]);
    }

    return new DefinitionBuilder(this._deps, this._lifeTime, { ...this._meta, ...metaOrAnnotator }, this._annotations);
  }

  using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TNewDeps
  ): DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime> {
    return new DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
      this._annotations,
    );
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

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      context => new cls(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>)),
      this._deps,
      this._meta,
    );

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
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

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }
}

export function using<TLifeTime extends LifeTime>(strategy: TLifeTime) {
  return <TDeps extends InstanceDefinition<any, any>[]>(...deps: TDeps): DefinitionBuilder<TDeps, TLifeTime> => {
    return new DefinitionBuilder<TDeps, TLifeTime>(deps, strategy, {}, []);
  };
}
