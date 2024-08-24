import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ClassType } from '../utils/ClassType.js';
import {
  assertValidDependencies,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { IServiceLocator } from '../container/IContainer.js';

import { AsyncDefinitionBuilder } from './AsyncDefinitionBuilder.js';
import { DefinitionAnnotation } from './DefinitionAnnotations.js';

export class DefinitionBuilder<
  TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[],
  TLifeTime extends LifeTime,
  TMeta,
> {
  constructor(
    protected _deps: TDeps,
    protected _lifeTime: TLifeTime,
    protected _meta: TMeta,
    protected _annotations: DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>[],
  ) {
    assertValidDependencies(this._lifeTime, this._deps);
  }

  async() {
    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, this._meta, []);
  }

  annotate<TNewMeta extends Record<string, any>>(
    metaOrAnnotator: TNewMeta | DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>,
  ): DefinitionBuilder<TDeps, TLifeTime, TMeta & TNewMeta>;
  annotate(
    metaOrAnnotator: DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>,
  ): DefinitionBuilder<TDeps, TLifeTime, TMeta>;
  annotate<TNewMeta extends Record<string, any>>(
    metaOrAnnotator: TNewMeta | DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>,
  ) {
    if (typeof metaOrAnnotator === 'function') {
      return new DefinitionBuilder(this._deps, this._lifeTime, this._meta, [
        ...this._annotations,
        metaOrAnnotator as DefinitionAnnotation<InstanceDefinition<TLifeTime, any, TMeta>>,
      ]);
    }

    return new DefinitionBuilder(this._deps, this._lifeTime, { ...this._meta, ...metaOrAnnotator }, this._annotations);
  }

  using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[]>(
    ...deps: TNewDeps
  ): DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta> {
    return new DefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
      this._annotations,
    );
  }

  define<TValue>(buildFn: (locator: IServiceLocator<TLifeTime>) => TValue) {
    const definition = InstanceDefinition.create(this._lifeTime, buildFn, this._deps, this._meta);

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  thunk<TValue>(buildFn: (locator: IServiceLocator<TLifeTime>) => TValue) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      (context: IServiceLocator) => {
        return () => buildFn(context);
      },
      this._deps,
      this._meta,
    );

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      context => new cls(...(this._deps.map(context.use) as InstancesArray<TDeps>)),
      this._deps,
      this._meta,
    );

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue) {
    const definition = InstanceDefinition.create(
      this._lifeTime,
      context => {
        return factory(...(this._deps.map(context.use) as InstancesArray<TDeps>));
      },
      this._deps,
      this._meta,
    );

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }
}
