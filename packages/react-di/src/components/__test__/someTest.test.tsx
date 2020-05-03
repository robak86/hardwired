import { module } from '@hardwired/di';
import { render } from '@testing-library/react';
import * as React from 'react';
import { FunctionComponent } from 'react';
// import '@testing-library/jest-dom/extend-expect'
// import '@testing-library/jest-dom/extend-expect';

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').defineConst('a', 'a');
    expect(m.toContainer({}).get('a')).toEqual('a');
  });

  it(`works with enzyme`, async () => {
    const Test: FunctionComponent = () => <div>It works</div>;
    const wrapper = render(<Test />);
    console.log(wrapper.debug());
  });
});
