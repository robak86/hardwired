import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { IObservableValue, observable as observableImpl } from 'mobx';
import { v4 } from 'uuid';

export type StateBuildFn = {
  <TValue, TDeps extends any[]>(value: TValue): InstanceDefinition<IObservableValue<TValue>, LifeTime.singleton>;
};

export const state: StateBuildFn = value => {
  return new InstanceDefinition({
    id: `observable:${v4()}`,
    externals: [],
    strategy: LifeTime.singleton,
    create: () => observableImpl.box(value),
  });
};
