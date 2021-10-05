import { ContainerContext } from '../context/ContainerContext';
import { InstanceDefinition } from '../definitions/InstanceDefinition';

export interface IServiceLocator {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue>): TValue;

  asObject<TModule extends Record<string, InstanceDefinition<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceDefinition<infer TValue> ? TValue : unknown }; // TODO: add alias to this mapped type

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn;
}
