import { expectType, TypeEqual } from 'ts-expect';
import { Module, module, DependencyFactory, value } from 'hardwired';
import { DummyComponent } from '../DummyComponent';
import { component } from '../resolvers/ComponentResolver';
import { Component, ComponentsDefinitions } from '../Component';
import { render } from '@testing-library/react';
import * as React from 'react';
import { createContainer } from '../createContainer';

describe(`Component`, () => {
  function setup() {
    const m1 = module('myModule')
      .define('val1', _ => value('val1'))
      .define('someComponent', _ => component(DummyComponent, { value: _.val1 }));

    const { Container } = createContainer(m1);

    return render(
      <Container context={{}}>
        {/*<Component module={m1} name={'someComponent'} props={{ value: 'sdf' }} />*/}
        <Component module={m1} name={'someComponent'} />
      </Container>,
    );
  }

  it(`renders inner component`, async () => {
    const wrapper = setup();
    expect(wrapper.getByTestId('value').textContent).toEqual('val1');
  });
});

describe(`ComponentDefinitions`, () => {
  it(`selects only components definitions`, async () => {
    const m = module('test')
      .define('someStringValue', _ => value('SomeValue'))
      .define('someComponent', _ => component(DummyComponent, { value: _.someStringValue }));

    type Actual = ComponentsDefinitions<Module.Registry<typeof m>>;
    type Expected = {
      someComponent: DependencyFactory<typeof DummyComponent>;
    };

    expectType<TypeEqual<Actual, Expected>>(true);
  });
});
