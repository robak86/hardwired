import { Matrix } from './Matrix';
import React from 'react';
import { useWatchable } from 'hardwired-react';
import { matrixModule } from '../matrix.module';

export const MatrixContainer = () => {
  const elements = useWatchable(matrixModule, 'selectMatrixElements');
  return <Matrix elements={elements} />;
};
