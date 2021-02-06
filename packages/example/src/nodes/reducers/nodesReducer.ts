import { DiagramNode, NodesState } from '../state/NodesState';
import { addNode, removeNode, setNodePositionAction } from '../actions/nodeActions';
import { createReducer } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

const nodesIdsReducer = createReducer<string[]>([], builder => {
  builder
    .addCase(addNode, (state, action) => {
      state.push(action.payload.nodeId);
    })
    .addCase(removeNode, (state, action) => {
      state.splice(state.indexOf(action.payload.nodeId), 1);
    });
});

const nodesPositionsReducer = createReducer<Record<string, DiagramNode>>({}, builder => {
  builder
    .addCase(addNode, (state, action) => {
      state[action.payload.nodeId] = { x: 0, y: 0 };
    })
    .addCase(removeNode, (state, action) => {
      delete state[action.payload.nodeId];
    })
    .addCase(setNodePositionAction, (state, action) => {
      state[action.payload.nodeId] = { x: action.payload.x, y: action.payload.y };
    });
});

export const nodesReducer = combineReducers<NodesState>({
  nodesIds: nodesIdsReducer,
  nodesPositions: nodesPositionsReducer,
});
