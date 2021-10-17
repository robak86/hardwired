import { NodesState } from '../nodes/state/NodesState';

export type AppState = {
  nodes: NodesState;
};

export const AppState = {
  build(): AppState {
    return {
      nodes: NodesState.build(),
    };
  },
};
