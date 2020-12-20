import { NodesState } from '../state/NodesState';

export const selectNodesIds = (state: NodesState) => state.nodesIds;

export const selectPositions = (state: NodesState) => state.nodesPositions;

// TODO: should we rather prefer opposite order of args ?
export const selectNodePosition = (state: NodesState, nodeId: string) => state['nodesPositions'][nodeId];

// TODO This would make testing easier - just pass mock and check if it was called with nodeId
export const selectNodePositionV2 = (nodeId: string) => (state: NodesState) => state['nodesPositions'][nodeId];

// TODO: but what about case like - this is not selector anymore (does not take sate as an param ?)
// ...but it may be actually a good direction - given function is not coupled to state any more, and has more focused
// responsibility ?
export const selectNodePositionV3 = (positions: NodesState['nodesPositions'], nodeId: string) => positions[nodeId];
