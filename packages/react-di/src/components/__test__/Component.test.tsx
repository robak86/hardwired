import { expectType, TypeEqual } from 'ts-expect';
import { Module, module, DependencyFactory, value } from 'hardwired';
import { DummyComponent } from '../DummyComponent';
import { component, MaterializedComponent } from '../resolvers/ComponentResolver';
import { ComponentsDefinitions } from '../Component';
import { render } from '@testing-library/react';
import * as React from 'react';
import { createContainer } from '../createContainer';

describe(`Component`, () => {
  describe(`using dependencies from root module`, () => {
    function setup() {
      const m1 = module('myModule')
        .define('val1', _ => value('val1'))
        .define('someComponent', _ => component(DummyComponent, { value: _.val1 }));

      const { Container, Component } = createContainer();

      return render(
        <Container context={{}}>
          <Component module={m1} name={'someComponent'} optionalValue={'extra'} />
        </Container>,
      );
    }

    it(`renders inner component`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });

    it(`propagates props to the underlying component`, async () => {
      const wrapper = setup();
      expect(wrapper.getByTestId('optional-value').textContent).toEqual('extra');
    });
  });
});

describe(`ComponentDefinitions`, () => {
  it(`selects only components definitions`, async () => {
    const m = module('test')
      .define('someStringValue', _ => value('SomeValue'))
      .define('someComponent', _ => component(DummyComponent, { value: _.someStringValue }));

    type Actual = ComponentsDefinitions<Module.Registry<typeof m>>;
    type Expected = {
      someComponent: DependencyFactory<MaterializedComponent<typeof DummyComponent>>;
    };

    expectType<TypeEqual<Actual, Expected>>(true);
  });
});
