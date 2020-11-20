import { FunctionComponent } from 'react';
import React = require('react');

export type DummyComponentProps = {
  value: string;
};

export const DummyComponent: FunctionComponent<DummyComponentProps> = ({ value }) => {
  return (
    <>
      <div data-testid="value">{value}</div>
    </>
  );
};
