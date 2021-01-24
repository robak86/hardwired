// selecting data from cross areas increases coupling and it's like pulling data from one service to another

// TODO: or StateService, StateCrumb, StateTrait
// It Replaces selector
// It is consumeable by
// All state traits needs to be eagerly loaded
// Does the order matter ? it should not!!
import { Action, ActionCreator, ActionWithPayloadCreator } from './Action';


class MatchedReducer<TState> {
  matchesAction = <ActionCreator extends TypedActionCreator<string>>(
    actionCreator: ActionCreator,
    reducer: (state: TState, action: ReturnType<ActionCreator>) => TState,
  ): ((state: TState, action: ReturnType<ActionCreator>) => TState) => {
    throw new Error('');
  };

  filter = () => {};
}

export abstract class StateTrait<TState> {
  // TODO: !!!!! gdyby tutaj użyć mobx !!!!!!!!! ?!?!?! i mieć mutowalny stan + smart listener - autorun reactions
  // TODO: but it's probably redundant, because we don't need @computed @action, and complex composition abilities
  // Instead of using mobx, leverage immutability and pure components!
  readonly state!: TState;
  abstract readonly initialState: TState;
  protected actionsMatcher: MatchedReducer<TState> = new MatchedReducer<TState>();

  constructor() {
    // this.state = this.initState();
    // this.reduce = createReducer(this.state, builder => {
    //   this.buildReducer(builder);
    // });
  }

  reduce(state: TState, action: Action<any>): TState {
    throw new Error('implement me');
  }

  dispatch(action: Action<any>) {
    const newState = this.reduce(this.state, action);

    if (newState !== this.state) {
      (this as any).state = newState;

      this.notify();
    }
  }

  // protected abstract buildReducers(): ((state: TState, action: any) => TState)[];

  subscribe() {}

  notify() {}

  abstract reducers: ((state: TState, action: any) => TState)[];
}

type Matcher<TAction, TState> = {};

//addCase<ActionCreator extends TypedActionCreator<string>>(actionCreator: ActionCreator, reducer: CaseReducer<State, ReturnType<ActionCreator>>): ActionReducerMapBuilder<State>;

type DummyState = number;

// TODO: consider using immer + add two variants - MutableDummyStateTrait + ImmutableDummyStateTrait
class DummyStateTrait extends StateTrait<DummyState> {
  initialState = 1;
  reducers = [
    this.actionsMatcher.matchesAction(increment, () => {
      return 1;
    }),
    this.actionsMatcher.matchesAction(decrement, () => {
      return 2;
    }),
  ];
}

import { ActionReducerMapBuilder, CaseReducer, createAction, createReducer, getType } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

const increment = createAction<number, 'counter/increment'>('counter/increment');
const decrement = createAction<number, 'counter/decrement'>('counter/decrement');

type TypedActionCreator<Type extends string> = {
  (...args: any[]): Action<Type>;
  type: Type;
};

type a = ReturnType<typeof increment>;
const ww = getType(increment);
