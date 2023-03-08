
import * as React from 'react';

export type DummyComponentProps = {
  value: string | number;
  optionalValue?: string | number;
};

export const DummyComponent: React.FC<DummyComponentProps> = ({ value, optionalValue }) => {
  return (
    <>
      <div data-testid="value">{value}</div>
      <div data-testid="optional-value">{optionalValue}</div>
    </>
  );
};
