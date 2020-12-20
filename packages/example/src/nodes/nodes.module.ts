import { func, Module, unit } from '@hardwired/core';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';
import { dispatch } from '@hardwired/redux';
import { setNodePositionAction } from './actions/nodeActions';

export const nodesModule = unit('node')
  .define('store', storeModule)
  .define('selectNodesIds', func(selectNodesIds, 1), ['store.state'])
  .define('selectNodePosition', func(selectNodePosition, 1), ['store.state'])
  .define('setNodePosition', dispatch(setNodePositionAction), ['store.store']);
