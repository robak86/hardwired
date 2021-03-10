import { unit } from 'hardwired';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';

import { setNodePositionAction } from './actions/nodeActions';
import { AnyAction, Store } from 'redux';
import { singleton } from '../../../core/src/strategies/SingletonStrategy';

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

export const nodesModule = unit()
  .import('storeModule', storeModule)
  .define('selectNodesIds', () => selectNodesIds, singleton)
  .define('selectNodePosition', () => selectNodePosition, singleton)
  .define('setNodePosition', ({ storeModule }) => storeModule.boundAction(setNodePositionAction), singleton)
  .build();
