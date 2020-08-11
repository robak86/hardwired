import { container, module, value } from "@hardwired/di-next";
import * as React from "react";

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').define('a', _ => value('a'));

    expect(container(m).get('a')).toEqual('a');
  });

  // it(`works with enzyme`, async () => {
  //   const Test: FunctionComponent = () => <div>It works</div>;
  //   const wrapper = render(<Test />);
  //   console.log(wrapper.debug());
  // });
});
