import { singleton, value } from 'hardwired';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';

import { setNodePositionAction } from './actions/nodeActions';
import { AnyAction, Store } from 'redux';

// const dispatchAction = <TPayload, TAction extends AnyAction>(
//   store: Store<any>,
//   actionCreator: (payload: TPayload) => TAction,
// ): Instance<(payload: TPayload) => void> => {
//   return new SingletonStrategy(() => (payload: TPayload) => store.dispatch(actionCreator(payload)));
// };

const dispatchAction = <TPayload, TAction extends AnyAction>(
  store: Store<any>,
  actionCreator: (payload: TPayload) => TAction,
): ((payload: TPayload) => void) => {
  return (payload: TPayload) => store.dispatch(actionCreator(payload));
};

export const nodesModule = {
  selectNodesIds: value(selectNodesIds),
  selectNodePosition: value(selectNodePosition),
  setNodePosition: singleton.fn(boundAction => boundAction(setNodePositionAction), storeModule.boundAction),
};
