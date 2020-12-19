import { unit } from '@hardwired/core';
import { storeModule } from '../state/store.module';
import { selectNodePosition, selectNodesIds } from './selectors/nodesSelectors';
import { dispatch, selector } from '@hardwired/redux';
import { setNodePositionAction } from './actions/nodeActions';

export const nodesModule = unit('node')
  .define('store', storeModule)
  .define('selectNodesIds', selector(selectNodesIds, 0), ['store.store'])
  .define('selectNodePosition', selector(selectNodePosition, 0), ['store.store'])
  .define('setNodePosition', dispatch(setNodePositionAction), ['store.store']);
