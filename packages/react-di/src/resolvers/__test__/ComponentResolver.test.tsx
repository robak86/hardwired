import { useDependency } from '../../hooks/useDependency';
import { DummyComponent } from '../../testing/DummyComponent';
import { container, ContainerContext, Instance, unit } from 'hardwired';
import { render } from '@testing-library/react';
import { ContainerProvider } from '../../components/ContainerProvider';
import * as React from 'react';
import { ValueResolver } from '../../../../core/src/resolvers/ValueResolver';
import { component } from '../ComponentResolver';
import { FunctionComponent } from 'react';

describe(`ComponentResolver`, () => {
  class ObservableValue<T> extends Instance<T, []> {
    invalidate!: () => void;

    constructor(private value) {
      super();
    }

    build(context: ContainerContext, deps: []): T {
      return this.value;
    }

    onInit(context: ContainerContext, dependenciesIds: string[]) {
      this.invalidate = () => context.getInstancesEvents(this.id).invalidateEvents.emit();
    }

    setValue(newValue) {
      this.value = newValue;
      this.invalidate();
    }
  }

  function observable<TDeps extends any[], TValue>(value: TValue): Instance<TValue, []> {
    return new ObservableValue(value);
  }

  function setup() {
    const Consumer: FunctionComponent<{ prop1: number; prop2: string }> = ({ prop1, prop2 }) => {
      return (
        <>
          {prop1} {prop2}
        </>
      );
    };

    const componentResolver = component(Consumer);
    const m = unit('test')
      .define('stringProp', observable('initialValue'))
      .define('numberProp', observable(0))
      .define('someComponent', componentResolver, { prop1: 'numberProp', prop2: 'stringProp' });

    const c = container();

    return render(<ContainerProvider container={c}>


    </ContainerProvider>);
  }
});
