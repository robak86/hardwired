import React, { FunctionComponent } from "react";
import { MatrixElement } from "../state/MatrixState";

export type MatrixCellProps = {
  value: MatrixElement;
};

export const MatrixCell: FunctionComponent<MatrixCellProps> = ({ value }) => {
  return <span>{JSON.stringify(value)}</span>;
};
