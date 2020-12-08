import { MatrixElement } from '../state/MatrixState';
import React, { FunctionComponent } from 'react';
import { MatrixCell } from './MatrixCell';

export type MatrixProps = {
  elements: MatrixElement[][];
};

export const Matrix: FunctionComponent<MatrixProps> = ({ elements }) => {
  return (
    <div>
      {elements.map((row, idx) => {
        return (
          <div key={idx}>
            {row.map((cell, idx) => (
              <MatrixCell value={cell} key={idx} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
