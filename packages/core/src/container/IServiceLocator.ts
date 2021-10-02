import { ContainerContext } from '../context/ContainerContext';
import { InstanceEntry } from '../new/InstanceEntry';

export interface IServiceLocator {
  get<TValue>(instanceDefinition: InstanceEntry<TValue>): TValue;

  asObject<TModule extends Record<string, InstanceEntry<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceEntry<infer TValue> ? TValue : unknown }; // TODO: add alias to this mapped type

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn;
}
