import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { IContainerScopes, InstanceCreationAware, IServiceLocator } from '../container/IContainer.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { Container } from '../container/Container.js';
import { ClassType } from '../utils/ClassType.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import {
  assertValidDependencies,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { DefinitionAnnotation } from '../eager/EagerDefinitionsInterceptor.js';

export class AsyncDefinitionBuilder<
  TDeps extends AnyInstanceDefinition<any, any, any>[],
  TLifeTime extends LifeTime,
  TMeta,
> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
    private _meta: TMeta,
    private _annotations: DefinitionAnnotation<AnyInstanceDefinition<TLifeTime, any, TMeta>>[],
  ) {
    assertValidDependencies(this._lifeTime, this._deps);
  }

  annotate<TNewMeta extends Record<string, any>>(
    meta: TNewMeta,
  ): AsyncDefinitionBuilder<TDeps, TLifeTime, TMeta & TNewMeta>;
  annotate(
    meta: DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>,
  ): AsyncDefinitionBuilder<TDeps, TLifeTime, TMeta>;
  annotate(meta: object | AnyInstanceDefinition<TLifeTime, any, any>) {
    if (typeof meta === 'function') {
      return new AsyncDefinitionBuilder(this._deps, this._lifeTime, this._meta, [
        ...this._annotations,
        meta as DefinitionAnnotation<AnyInstanceDefinition<TLifeTime, any, TMeta>>,
      ]);
    }

    return new AsyncDefinitionBuilder(this._deps, this._lifeTime, { ...this._meta, ...meta }, this._annotations);
  }

  using<TNewDeps extends AnyInstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, TMeta>[]>(
    ...deps: TNewDeps
  ): AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta> {
    return new AsyncDefinitionBuilder<[...TDeps, ...TNewDeps], TLifeTime, TMeta>(
      [...this._deps, ...deps],
      this._lifeTime,
      this._meta,
      this._annotations,
    );
  }

  define<TValue>(
    fn: (locator: IServiceLocator<TLifeTime>) => TValue | Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime, TMeta> {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async (context: IServiceLocator) => {
        return fn(context);
      },
      dependencies: this._deps,
      meta: this._meta,
    });

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = (await Promise.all(this._deps.map(context.use))) as InstancesArray<TDeps>;
        return new cls(...dependenciesInstance);
      },
      dependencies: this._deps,
      meta: this._meta,
    });

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue | Promise<TValue>) {
    const definition = asyncDefinition({
      strategy: this._lifeTime,
      create: async context => {
        const dependenciesInstance = await Promise.all(this._deps.map(context.use));
        return factory(...(dependenciesInstance as InstancesArray<TDeps>));
      },
      dependencies: this._deps,
      meta: this._meta,
    });

    return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
  }
}
