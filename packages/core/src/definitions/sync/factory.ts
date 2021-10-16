import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export interface IFactory<TReturn, TParams extends any[]> {
  build(...params: TParams): TReturn;
}

export type FactoryBuildFn = {
  <TInstance, TParams extends any[]>(definition: InstanceDefinition<TInstance, any, TParams>): InstanceDefinition<
    IFactory<TInstance, TParams>,
    LifeTime.singleton,
    []
  >;
};

export const factory: FactoryBuildFn = definition => {
  return {
    id: v4(),
    strategy: LifeTime.singleton,
    resolution: Resolution.sync,
    externals: [],
    create: (context): IFactory<any, any> => {
      return {
        build(...params): any {
          return context.get(definition, ...params);
        },
      };
    },
  };
};
