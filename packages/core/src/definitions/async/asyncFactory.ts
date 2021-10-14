import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';

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
    strategy: TransientStrategy.type,
    isAsync: false,
    externalsIds: [],
    create: (context): IAsyncFactory<any, any> => {
      return {
        build(params) {
          return context.getAsync(definition, params);
        },
      };
    },
  };
};
