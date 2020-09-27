import { MatrixState } from '../matrix/state/MatrixState';

export type AppState = MatrixState & {
  value: string;
};
