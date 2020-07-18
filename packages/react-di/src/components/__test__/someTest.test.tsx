import { container, module } from '@hardwired/di-core';
import * as React from 'react';

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').value('a', 'a');
    expect(container(m).get('a')).toEqual('a');
  });

  // it(`works with enzyme`, async () => {
  //   const Test: FunctionComponent = () => <div>It works</div>;
  //   const wrapper = render(<Test />);
  //   console.log(wrapper.debug());
  // });
});
