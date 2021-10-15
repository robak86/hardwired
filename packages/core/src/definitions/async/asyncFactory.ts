import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { SingletonStrategy } from '../../strategies/sync/SingletonStrategy';

export interface IAsyncFactory<TReturn, TParams extends any[]> {
  build(...params: TParams): Promise<TReturn>;
}

export type AsyncFactoryBuildFn = {
  <TInstance, TParams extends any[]>(definition: AnyInstanceDefinition<TInstance, TParams>): InstanceDefinition<
    IAsyncFactory<TInstance, TParams>,
    []
  >;
};

export const asyncFactory: AsyncFactoryBuildFn = (definition: AnyInstanceDefinition<any, any>) => {
  return {
    id: v4(),
    strategy: SingletonStrategy.type,
    isAsync: false,
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
