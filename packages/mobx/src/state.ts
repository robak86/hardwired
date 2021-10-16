import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { IObservableValue, observable as observableImpl } from 'mobx';
import { v4 } from 'uuid';

export type StateBuildFn = {
  <TValue, TDeps extends any[]>(value: TValue): InstanceDefinition<IObservableValue<TValue>, LifeTime.singleton>;
};

export const state: StateBuildFn = value => {
  return {
    id: `observable:${v4()}`,
    resolution: Resolution.sync,
    externals: [],
    strategy: LifeTime.singleton,
    create: () => observableImpl.box(value),
  };
};
