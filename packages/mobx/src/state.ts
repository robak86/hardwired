import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { IObservableValue, observable as observableImpl } from 'mobx';
import { v4 } from 'uuid';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[]>(value: TValue): InstanceDefinition<IObservableValue<TValue>>;
};

export const state: ComputedBuildFn = (value): InstanceDefinition<any> => {
  return {
    id: `observable:${v4()}`,
    strategy: SingletonStrategy.type,
    create: () => observableImpl.box(value),
    dependencies: [],
    meta: undefined,
  };
};
