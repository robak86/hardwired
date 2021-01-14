import { container, module, value } from 'hardwired';
import { provider } from '../ProviderResolver';
import { DummyProvider, useDummyProviderValue } from '../../testing/DummyProvider';
import { DummyComponent } from '../../testing/DummyComponent';
import { render } from '@testing-library/react';
import { ContainerProvider } from '../../components/ContainerProvider';
import * as React from 'react';

describe(`ProviderResolver`, () => {
  // const m1 = module('testModule')
  //   .define('value', value(456))
  //   .defineStructured('dummyProvider', provider(DummyProvider), { value: 'value' });
  //
  // function setup() {
  //   const Consumer = () => {
  //     const value = useDummyProviderValue();
  //     return <DummyComponent value={value} />;
  //   };
  //
  //   const c = container();
  //   c.load(m1);
  //
  //   return render(
  //     <ContainerProvider container={c}>
  //       <Consumer />
  //     </ContainerProvider>,
  //   );
  // }
  //
  // it(`renders providers`, async () => {
  //   const wrapper = setup();
  //   expect(wrapper.getByTestId('value').textContent).toEqual('456');
  // });
});
