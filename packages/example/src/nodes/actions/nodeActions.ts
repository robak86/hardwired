import { createAction } from 'typesafe-actions';

export const setNodePositionAction = createAction('[Node] setPosition')<{
  id: string;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
}>();
