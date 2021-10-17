import { NodesState } from '../state/NodesState';

export const selectNodesIds = (state: NodesState) => state.nodesIds;

export const selectPositions = (state: NodesState) => state.nodesPositions;

export const selectNodePosition = (nodeId: string) => (state: NodesState) => state['nodesPositions'][nodeId];
