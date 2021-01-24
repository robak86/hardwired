import { Action, ActionWithPayload } from './Action';
import { StateTrait } from './StateTrait';


// TODO: replay latest ?
// TODO: how to do lazy loading of StateTraits - how to populate them with existing data ? replay events ?
export abstract class ActionsDispatcher {
  constructor(protected middlewares: any[]) {}

  subscribe(signal: Action<any>, update: () => any):void;
  subscribe<T>(signal: ActionWithPayload<any, T>, update: <TState>(payload: T, previousState: TState) => TState) {
    throw new Error('implement me');
  }

  registerTrait(state: StateTrait<any>){

  }
}
