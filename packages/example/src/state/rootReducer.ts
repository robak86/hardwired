import { combineReducers } from "redux";
import { AppState } from "./AppState";
import { nodesIdsReducer, nodesPositionsReducer } from "../nodes/reducers/nodesReducer";

export const rootReducer = combineReducers<AppState>({
  nodesIds: nodesIdsReducer,
  nodesPositions: nodesPositionsReducer,
});
