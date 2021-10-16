import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export interface IAsyncFactory<TReturn, TParams extends any[]> {
  build(...params: TParams): Promise<TReturn>;
}

export type AsyncFactoryBuildFn = {
  <TInstance, TParams extends any[]>(definition: AnyInstanceDefinition<TInstance, any, TParams>): InstanceDefinition<
    IAsyncFactory<TInstance, TParams>,
    LifeTime.transient,
    []
  >;
};

export const asyncFactory: AsyncFactoryBuildFn = (definition: AnyInstanceDefinition<any, any, any>) => {
  return {
    id: v4(),
    strategy: LifeTime.transient,
    resolution: Resolution.sync,
    externals: [],
    create: (context): IAsyncFactory<any, any> => {
      return {
        build(...params) {
          return context.getAsync(definition, ...params);
        },
      };
    },
  };
};
