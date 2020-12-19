import { NodesState } from '../state/NodesState';
import { ActionType, getType } from 'typesafe-actions';
import { setNodePositionAction } from '../actions/nodeActions';

type NodeAction = ActionType<typeof setNodePositionAction>;

export function nodesIdsReducer(state: NodesState['nodesIds'] = [], action): NodesState['nodesIds'] {
  return state;
}

export function nodesPositionsReducer(
  state: NodesState['nodesPositions'] = {},
  action: NodeAction,
): NodesState['nodesPositions'] {
  switch (action.type) {
    case getType(setNodePositionAction):
      return {
        ...state,
        [action.payload.id]: { x: action.payload.x, y: action.payload.y },
      };
  }

  return state;
}
