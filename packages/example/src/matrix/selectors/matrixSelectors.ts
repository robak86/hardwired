import { MatrixElement, MatrixState } from '../state/MatrixState';

export const selectMatrixElements = (state: MatrixState) => {
  const elements: MatrixElement[][] = [];

  state.matrix.forEach((row, x) => {
    const rowElements = elements[0] || (elements[0] = []);

    row.forEach((cell, y) => {
      rowElements.push({ coords: [x, y], value: cell });
    });
  });

  return elements;
};
