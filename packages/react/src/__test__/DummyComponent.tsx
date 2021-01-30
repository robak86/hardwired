import { FunctionComponent } from 'react';
import React = require('react');

export type DummyComponentProps = {
  value: string | number;
  optionalValue?: string | number;
};

export const DummyComponent: FunctionComponent<DummyComponentProps> = ({ value, optionalValue }) => {
  return (
    <>
      <div data-testid="value">{value}</div>
      <div data-testid="optional-value">{optionalValue}</div>
    </>
  );
};
