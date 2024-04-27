import {
  AnyInstanceDefinition,
  assertValidDependency,
  ClassType,
  DefinitionAnnotation,
  InstanceDefinition,
  InstancesArray,
  LifeTime,
  Resolution,
  ValidDependenciesLifeTime,
} from 'hardwired';
import { ActionSuccessType, IDispatcherYields } from './ActionBuilder.js';
import { Dispatcher, dispatcherD } from '../dispatching/dispatcher.js';
import { Thunk } from '../types/thunk.js';
import { v4 } from 'uuid';

type ActionExecutor<TArgs extends any[], TSuccess, TError, TReturn> = {
  execute(...args: TArgs): TReturn | Promise<TReturn>;
};

export class StateBuilder<
  TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[],
  TLifeTime extends LifeTime,
  TSuccess,
  TError,
> {
  constructor(
    protected _deps: TDeps,
    protected _lifeTime: TLifeTime,
    // protected _meta: { success: TSuccess; error: TError },
    protected _annotations: DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>[],
  ) {
    assertValidDependency(this._lifeTime, this._deps);
  }

  annotate(metaOrAnnotator: object | DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>) {
    if (typeof metaOrAnnotator === 'function') {
      return new StateBuilder(
        this._deps,
        this._lifeTime,
        // this._meta,
        [...this._annotations, metaOrAnnotator as DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>],
      );
    }

    throw new Error('Implement me!');
    // return new StateBuilder(this._deps, this._lifeTime, { ...this._meta, ...metaOrAnnotator }, this._annotations);
  }

  using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[]>(
    ...deps: TNewDeps
  ): StateBuilder<[...TDeps, ...TNewDeps], TLifeTime, TSuccess, TError> {
    return new StateBuilder<[...TDeps, ...TNewDeps], TLifeTime, TSuccess, TError>(
      [...this._deps, ...deps],
      this._lifeTime,
      // this._meta,
      this._annotations,
    );
  }

  // TODO: should return Instance & (deps) => TInstance - but how pass invoker?
  class<TInstance extends ActionExecutor<any, any, any, any>>(
    cls: ClassType<TInstance, [IDispatcherYields<any, any>, ...InstancesArray<TDeps>]>,
  ): InstanceDefinition<TInstance, TLifeTime, { success: TSuccess; error: TError }> {
    const actionId = v4();

    return new InstanceDefinition(
      actionId,
      Resolution.sync,
      this._lifeTime,
      context => {
        const dispatcher: Dispatcher = context.buildWithStrategy(dispatcherD);

        const yields = dispatcher.bind(actionId);

        return new cls(yields, ...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>));
      },
      this._deps,
      // this._meta,
    );
  }
}

export const action = <TSuccess = never, TError = unknown>() =>
  new StateBuilder<[], LifeTime.transient, TSuccess, TError>([], LifeTime.transient, []);
