import { func, Module, unit } from 'hardwired';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';

import { setNodePositionAction } from './actions/nodeActions';

export const nodesModule = unit('node')
  .import('store', storeModule)
  // .define('selectNodesIds', func(selectNodesIds, 1), ['store.state'])
  // .define('selectNodePosition', func(selectNodePosition, 1), ['store.state'])
  // .define('setNodePosition', dispatch(setNodePositionAction), ['store.store']);
