import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from "../../strategies/sync/TransientStrategy";

export interface IFactory<TReturn, TParams extends any[]> {
  build(...params: TParams): TReturn;
}

export type FactoryBuildFn = {
  <TInstance, TParams>(definition: InstanceDefinition<TInstance, TParams>): InstanceDefinition<
    IFactory<TInstance, TParams extends void ? [] : [TParams]>,
    void
  >;
};

export const factory: FactoryBuildFn = (definition: InstanceDefinition<any, any>) => {
  // throw new Error('Implement me!');
  // return {};

  return {
    id: v4(),
    strategy: TransientStrategy.type, // TODO: should it be only limited to transient ??
    isAsync: false,
    externalsIds: [],
    create: (build):IFactory<any, any> => {



      return {
        build(...params): any {

        }
      }
    }
  };
};
