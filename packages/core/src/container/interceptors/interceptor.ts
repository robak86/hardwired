import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

// TODO: to make lifetimes work, we should be able to build a graph of dependencies in the interceptor, so when
// a singleton definition is remounted we can all all the callbacks and don't have to rely on the create callback,
// as it won't be called!!!

// export interface IInterceptor {
//   // this should help creating graph of dependencies when the definition is requested from the container
//   onClassInstanceCreate<T, TArgs extends any[]>(definition: Definition<T, LifeTime, TArgs>, instance: T): T;
// }

export interface IInterceptor<TInstance> {
  // we enter the definition, and create new interceptor that will be used by the container to create the instance
  onEnter<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>, args: any[]): IInterceptor<TNewInstance>; // before create (definition becomes our origin)
  onLeave(instance: TInstance, definition: Definition<TInstance, LifeTime, any[]>): TInstance;

  onNewScope?(): IInterceptor<TInstance>; // TODO:
}

// TODO: implement composite interceptor that will call all the interceptors in the chain

/**
 * A -> B -> C1
 *        -> C2
 *
 *   -> D -> E -> F1
 *             -> F2
 *
 * onEnter(A)
 *    onEnter(B)
 *      onEnter(C1)
 *      onLeave(instance of C1)
 *      onEnter(C2)
 *      onLeave(instance of C2)
 *    onLeave(instance of B)
 *    onEnter(D)
 *      onEnter(E)
 *        onEnter(F1)
 *        onLeave(instance of F1)
 *        onEnter(F2)
 *        onLeave(instance of F2)
 *       onLeave(instance of E)
 *     onLeave(instance of D)
 */
