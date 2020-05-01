import { module } from '@hardwired/di';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { shallow } from 'enzyme';

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').defineConst('a', 'a');
    expect(m.toContainer({}).get('a')).toEqual('a');
  });

  it(`works with enzyme`, async () => {
    const Test: FunctionComponent = () => <div>It works</div>;
    const wrapper = shallow(<Test />);
    console.log(wrapper.debug());
  });
});
