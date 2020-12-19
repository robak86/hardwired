import { NodesState } from '../state/NodesState';

export const selectNodesIds = (state: NodesState) => state.nodesIds;

export const selectNodePosition = (state: NodesState) => (nodeId: string) => state['nodesPositions'][nodeId];
