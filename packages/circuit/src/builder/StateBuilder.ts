import { buildContext, DefineFn, InstanceDefinition, LifeTime } from 'hardwired';
import { ActionSuccessType, AnyActionDefinition } from './ActionBuilder.js';

import { UnwrapThunk } from '../types/thunk.js';
import { v4 } from 'uuid';
import { Dispatcher, dispatcherD } from '../dispatching/dispatcher.js';

export type StateExtensions<TState> = {
  effect<
    TActionDefinition extends AnyActionDefinition,
    THandler extends (state: TState, actionPayload: ActionSuccessType<UnwrapThunk<TActionDefinition>>) => unknown,
  >(
    action: TActionDefinition,
    handler: THandler,
  ): void;
};

export const state = <TState extends object>(
  defineFn: DefineFn<TState, LifeTime.transient, StateExtensions<TState>>,
) => {
  return new InstanceDefinition(v4(), LifeTime.transient, context => {
    const dispatcher: Dispatcher = context.use(dispatcherD);

    const subscriptions = new Map<string, any>();

    const contextWithExt = {
      ...buildContext(LifeTime.transient, context),
      effect<
        TActionDefinition extends AnyActionDefinition,
        THandler extends (state: TState, actionPayload: ActionSuccessType<UnwrapThunk<TActionDefinition>>) => unknown,
      >(action: TActionDefinition, handler: THandler) {
        subscriptions.set(action.id, handler);
      },
    };

    const state = defineFn(contextWithExt);
    subscriptions.forEach((handler, actionId) => {
      dispatcher.subscribe(actionId, (actionPayload: any) => {
        return handler(state, actionPayload);
      });
    });

    return state;
  });
};

// export class StateBuilder<
//   TState extends object,
//   TDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[],
//   TLifeTime extends LifeTime,
// > {
//   constructor(
//     protected _deps: TDeps,
//     protected _lifeTime: TLifeTime,
//     protected _meta: { state: true },
//     protected _annotations: DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>[],
//     protected _effects: { action: Thunk<AnyActionDefinition>; handler: (state: any, input: any) => void }[] = [],
//   ) {
//     assertValidDependency(this._lifeTime, this._deps);
//   }
//
//   annotate(metaOrAnnotator: object | DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>) {
//     if (typeof metaOrAnnotator === 'function') {
//       return new StateBuilder(
//         this._deps,
//         this._lifeTime,
//         this._meta,
//         [...this._annotations, metaOrAnnotator as DefinitionAnnotation<InstanceDefinition<TLifeTime, any, any>>],
//         this._effects,
//       );
//     }
//
//     return new StateBuilder(
//       this._deps,
//       this._lifeTime,
//       { ...this._meta, ...metaOrAnnotator },
//       this._annotations,
//       this._effects,
//     );
//   }
//
//   effect<
//     TActionDefinition extends Thunk<AnyActionDefinition>,
//     THandler extends (state: TState, actionPayload: ActionSuccessType<UnwrapThunk<TActionDefinition>>) => unknown,
//   >(action: TActionDefinition, handler: THandler): StateBuilder<TState, TDeps, TLifeTime> {
//     return new StateBuilder(
//       this._deps, //
//       this._lifeTime,
//       this._meta,
//       this._annotations,
//       [...this._effects, { action, handler }],
//     );
//   }
//
//   init(factory: (...args: InstancesArray<TDeps>) => TState) {
//     const definition = InstanceDefinition.create(
//       this._lifeTime,
//       context => {
//         const dispatcher: Dispatcher = context.buildWithStrategy(dispatcherD);
//
//         const state = factory(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>));
//
//         this._effects.forEach(({ action, handler }) => {
//           const actionId = action instanceof Function ? action().id : action.id;
//
//           dispatcher.subscribe(actionId, input => {
//             return handler(state, input);
//           });
//         });
//
//         return state;
//       },
//       this._deps,
//       this._meta,
//     );
//
//     return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
//   }
//
//   using<TNewDeps extends InstanceDefinition<any, ValidDependenciesLifeTime<TLifeTime>, any>[]>(
//     ...deps: TNewDeps
//   ): StateBuilder<TState, [...TDeps, ...TNewDeps], TLifeTime> {
//     return new StateBuilder<TState, [...TDeps, ...TNewDeps], TLifeTime>(
//       [...this._deps, ...deps],
//       this._lifeTime,
//       this._meta,
//       this._annotations,
//       this._effects,
//     );
//   }
//
//   // TODO: should return Instance & (deps) => TInstance - but how pass invoker?
//   // class<TInstance>(
//   //   cls: ClassType<
//   //     TInstance & { [K in keyof TEffects]: (params: ActionSuccessType<TEffects[K]>) => unknown },
//   //     InstancesArray<TDeps>
//   //   >,
//   // ): InstanceDefinition<TInstance, TLifeTime, { state: true }> {
//   //   const definition = InstanceDefinition.create(
//   //     this._lifeTime,
//   //     context => {
//   //       const instance = new cls(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>));
//   //
//   //       const dispatcher: Dispatcher = context.buildWithStrategy(dispatcherD);
//   //
//   //       Object.entries(this._effects).forEach(([method, action]) => {
//   //         const actionId = typeof action === 'function' ? action().id : action.id;
//   //
//   //         dispatcher.subscribe(actionId, instance[method].bind(instance));
//   //       });
//   //
//   //       return instance;
//   //     },
//   //     this._deps,
//   //     this._meta,
//   //   );
//   //
//   //   return this._annotations.reduce((def, annotation: any) => annotation(def), definition);
//   // }
// }

// export const state = <TState extends object>() =>
// new StateBuilder<TState, [], LifeTime.scoped>([], LifeTime.scoped, { state: true }, [], []);
