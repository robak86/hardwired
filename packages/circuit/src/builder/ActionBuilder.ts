import { buildContext, DefineFn, InstanceDefinition, LifeTime, value } from 'hardwired';
import { ACTION_INTERRUPT, Dispatcher, dispatcherD } from '../dispatching/dispatcher.js';
import { v4 } from 'uuid';

export interface IDispatcherYields<TSuccess, TError = unknown> {
  dispatch(success: TSuccess): Promise<unknown[]> | unknown[];
  abort(error: TError): never;
  call<TActionDefinition extends AnyActionDefinition>(
    action: TActionDefinition,
    ...args: ActionArgumentsType<TActionDefinition>
  ): ActionReturnType<TActionDefinition>;
}

type ActionDefinitionMeta<TSuccess = never, TError = unknown> = {
  success: TSuccess;
  error: TError;
};

type PromiseThunk<T> = Promise<T> | T;
type UnwrapPromiseThunk<T> = T extends PromiseThunk<infer U> ? U : T;

type Bindings<TInput, TSuccess, TError> = IDispatcherYields<TSuccess, TError> & { input: TInput };

interface ActionParams<TInput = unknown, TSuccess = never, TError = unknown> {
  key?: (input: TInput) => string;
  execute: DefineFn<PromiseThunk<void | TSuccess>, LifeTime.transient, Bindings<TInput, TSuccess, TError>>;
}

export const action = <TInput = unknown, TSuccess = never, TError = unknown>(
  params: ActionParams<TInput, TSuccess, TError>,
): InstanceDefinition<
  (input: TInput) => PromiseThunk<TSuccess | void>,
  LifeTime.transient,
  ActionDefinitionMeta<TSuccess, TError>
> => {
  const actionId = v4();

  return new InstanceDefinition(actionId, LifeTime.transient, context => {
    const dispatcher: Dispatcher = context.use(dispatcherD);

    return (input: TInput) => {
      try {
        const ctx = {
          input,
          ...dispatcher.bind(actionId, params?.key?.(input) ?? 'default'),
          ...buildContext(LifeTime.transient, context),
        };

        return params.execute(ctx);
      } catch (err) {
        if (err === ACTION_INTERRUPT) {
          // this only has sense if .abort returns a value
          console.log('action interrupted');
        } else {
          throw err;
        }
      }
    };
  });
};

type TInput = { ok: 123 };

const myAct = action<TInput, Success>({
  key: c => '123',
  execute: async c => {
    const a = await c.dispatch({ success: '123' });
  },
});

const someValue = value(123);
const someOtherValue = value('str');

type Success = {
  success: string;
};

type Error = {
  error: string;
};

export type ActionSuccessType<T> =
  T extends InstanceDefinition<any, any, { success: infer TSuccess; error: any }> ? TSuccess : never;

export type ActionErrorType<T> =
  T extends InstanceDefinition<any, any, { success: any; error: infer TError }> ? TError : never;

export type ActionArgumentsType<T> =
  T extends InstanceDefinition<(...args: infer TArgs) => any, any, ActionDefinitionMeta> ? TArgs : never;

export type ActionReturnType<T> =
  T extends InstanceDefinition<(...args: any[]) => infer TReturn, any, ActionDefinitionMeta> ? TReturn : never;

export type AnyActionDefinition = InstanceDefinition<any, LifeTime.transient, ActionDefinitionMeta<any, any>>;

// const myAction = action<boolean, Success, Error>()
//   .bind({ someValue, someOtherValue })
//   .execute(function (a: boolean) {
//     return this.someOtherValue;
//   });
//
// type OtherSuccess = {
//   success: number;
// };
//
// type OtherError = {
//   error: number;
// };
//
// // TODO: one can also pass union type to action
// const myOtherAction = action<string, OtherSuccess, OtherError>()
//   .bind({ someValue, someOtherValue })
//   .execute(async function (a: string) {
//     return this.someOtherValue;
//   });

// type WTF = ActionSuccessType<typeof myAction>;
//
// // TODO: invoker should remember last value for every action, so when a new instance is created it can trigger it's effects
// const myState = state()
//   .effect(myAction, 'someHandler')
//   .effect(myOtherAction, 'otherHandler')
//   .class(
//     class {
//       someHandler(param: Success) {}
//       otherHandler(param: OtherSuccess) {}
//     },
//   );
//
// useAction(myAction, true);
//
// type OptimisticUpdatePayload = {
//   optimistic: string;
//   scoreId: string;
// };
//
// const myCommandAction = action<QueryResult>()
//   .bind({ someValue, someOtherValue })
//   .fn(async function (a: boolean) {
//     // use dependencies to collect all the required parameters for optimistic update
//
//     const optimisticUpdatePayload: QueryResult = {
//       optimistic: 'value',
//       scoreId: '123',
//     };
//     const undoCallbacks = await this.dispatch(
//       optimisticUpdatePayload,
//       `score-update-${optimisticUpdatePayload.scoreId}`,
//     );
//
//     try {
//       // make request
//     } catch (error) {
//       // rollback
//       // await undoCallbacks();
//     }
//   });
//
// type QueryResult =
//   | {
//       status: 'done';
//       scoreId: string;
//     }
//   | { status: 'loading' }
//   | { status: 'error'; error: unknown };
//
// const myQueryAction = action<QueryResult>()
//   .bind({ someValue, someOtherValue })
//   .fn(async function (a: boolean) {
//     // use dependencies to collect all the required parameters for optimistic update
//
//     // collect all the parameters required for query input
//     try {
//       // const result = await this.rpcCall('getProjectList', {});
//       await this.dispatch({
//         status: 'done',
//         scoreId: '123',
//       });
//     } catch (error) {
//       await this.dispatch({
//         status: 'error',
//         error,
//       });
//     }
//
//     const otherActionResult = await this.call(otherAction, '');
//   });
