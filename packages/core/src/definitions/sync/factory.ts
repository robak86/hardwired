import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';

export interface IFactory<TReturn, TParams> {
  build(params: TParams): TReturn;
}

export type FactoryBuildFn = {
  <TInstance, TParams>(definition: InstanceDefinition<TInstance, TParams>): InstanceDefinition<
    IFactory<TInstance, TParams>,
    void
  >;
};

export const factory: FactoryBuildFn = (definition: InstanceDefinition<any, any>) => {
  return {
    id: v4(),
    strategy: TransientStrategy.type,
    isAsync: false,
    externalsIds: [],
    create: (context): IFactory<any, any> => {
      return {
        build(params): any {
          return context.get(definition, params);
        },
      };
    },
  };
};
