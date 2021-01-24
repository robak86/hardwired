// TODO: middlewares
// TODO: how to handle lists update

// TODO: don't allow any customization for action generator!!!
//    composing payload for actions should be done in specialized class!!! In other case it's tempting to force components
//    to know facts which are not necessary for the view layer
type Signal<T> = {
  type: T;
  addListener<T>(listener: (payload: T) => void); //Should we allow dispatching async functions ?
};

type SignalWithDispatch<T> = Signal<T> & { dispatch: (payload: T, onComplete?) => void };

type RequestSignals<T> = {
  onRequest: Signal<T>;
  onSuccess: Signal<T>;
  onFailure: Signal<T>;
  onCancel: Signal<T>;
};

type UserDetails = {
  a: 1;
};

const clearUser: Signal<UserDetails> = {} as any;

type SignalDescriptor<TState, T> = [Signal<T>, (action: T, state: TState) => TState];

// TODO dont invert dependencies. SignalsLog - accepts every action, and does not have any constraints on the type. This will
//  reduce coupling!!! SignalsLog is not coupled to any domain
class SignalsLog {
  constructor(private middlewaresOrInterceptors) {}

  register(signal, trait) {}

  //TODO: ability to add actions decoupling
  // support for addining middleware(but! for the middleware order of registrating is important!!!
}

// or use plain actions with typescript 4.1 literal type ?

// TODO: we would need to instantiate StateTraits eagerly in order to start all listeners!!
// TODO: resolvers need to be able to instantiate and cache class in onInit callback

//useStateTrait(module, 'traitName')

export abstract class ListStateTrait<TState> {
  protected readonly data = this.initState();
  protected subscriptions = [];

  constructor() {}

  abstract initState(): TState;
  abstract onInit();

  subscribe<T>(signal: Signal<T>, update: (action: T, previousState: TState) => TState) {}

  onItemChange(itemIdx, listener) {} // TODO ???
  onCollectionChange(listener) {} // TODO ???
}

// TODO: is it necessary... or we should use multiple StateTraits instead ?
//    it is necessary because we sometimes would like to switch data in a component at runtime (data for multiple tabs)
export abstract class ParametrizedStateTrait<TState> {
  protected readonly data = this.initState();
  protected subscriptions = [];

  constructor() {}

  abstract initState(): TState;
  abstract onInit();

  subscribe<T>(signal: Signal<T>, update: (action: T, previousState: TState) => TState) {}

  onItemChange(itemIdx, listener) {} // TODO ???
  onCollectionChange(listener) {} // TODO ??getByType
}

// TODO:

export abstract class SideEffect {
  protected subscriptions = [];

  constructor(protected signalsLog: SignalsLog) {}

  abstract onInit();

  subscribe<T>(signal: SignalWithDispatch<T>, update: (action: T) => void) {}

  // This require to have central dispatcher and support for filtering signals.... so in practice we need plain action objects :/
  *define() {
    // const action = yield take((action) =>  action.someProperty === true)
  }
}

class UserTokenStateTrait extends StateTrait<string> {
  initState(): string {
    return '';
  }

  onInit() {
    this.subscribe(clearUser, this.clearUser);
  }

  clearUser(action, state) {
    return state;
  }
}

// export class

class Signals {}
