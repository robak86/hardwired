import { createAction } from '@reduxjs/toolkit';

export type AddNodeActionPayload = { nodeId: string; x: number; y: number };
export const addNode = createAction<AddNodeActionPayload, 'node/add'>('node/add');

export type RemoveNodeActionPayload = { nodeId: string };
export const removeNode = createAction<RemoveNodeActionPayload, 'node/remove'>('node/remove');

export type SetNodePositionActionPayload = { nodeId: string; x: number; y: number };
export const setNodePositionAction = createAction<SetNodePositionActionPayload, 'node/setPosition'>('node/setPosition');
