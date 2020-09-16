import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

describe(`example`, () => {
  it(`works`, async () => {
    const node = <App />;
    console.log(node);
    const { getByText, ...result } = render(node);
    console.log(result.debug())


    const linkElement = getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});
