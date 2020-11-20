import { MatrixState } from "../state/MatrixState";

export function matrixReducer(state: MatrixState['matrix'], action): MatrixState['matrix'] {
  switch (action.type) {
    default:
      return state;
  }
}
