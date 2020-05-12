import { container, module, value } from '@hardwired/di';
import { render } from '@testing-library/react';
import * as React from 'react';
import { FunctionComponent } from 'react';

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').using(value).define('a', 'a');
    expect(container(m).get('a')).toEqual('a');
  });

  // it(`works with enzyme`, async () => {
  //   const Test: FunctionComponent = () => <div>It works</div>;
  //   const wrapper = render(<Test />);
  //   console.log(wrapper.debug());
  // });
});
