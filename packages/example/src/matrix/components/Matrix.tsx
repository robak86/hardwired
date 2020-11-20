import { MatrixElement } from '../state/MatrixState';
import React, { FunctionComponent } from 'react';
import { MatrixCell } from './MatrixCell';

export type MatrixProps = {
  elements: MatrixElement[][];
};

export const Matrix: FunctionComponent<MatrixProps> = ({ elements }) => {
  return (
    <div>
      {elements.map(row => {
        return (
          <div>
            {row.map(cell => (
              <MatrixCell value={cell} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
