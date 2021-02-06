import { Instance, SingletonStrategy, unit } from 'hardwired';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';

import { setNodePositionAction } from './actions/nodeActions';
import { AnyAction, Store } from 'redux';

const dispatchAction = <TPayload, TAction extends AnyAction>(
  store: Store<any>,
  actionCreator: (payload: TPayload) => TAction,
): Instance<(payload: TPayload) => void> => {
  return new SingletonStrategy(() => (payload: TPayload) => store.dispatch(actionCreator(payload)));
};

export const nodesModule = unit()
  .import('storeModule', storeModule)
  .define('selectNodesIds', () => selectNodesIds)
  .define('selectNodePosition', () => selectNodePosition)
  .define('setNodePosition', ({ storeModule }) => dispatchAction(storeModule.store, setNodePositionAction))
  .build();
