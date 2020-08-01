import { AbstractDependencyResolver, AbstractRegistryDependencyResolver } from './AbstractDependencyResolver';
//
// export type DependencyResolverFunction<TRegistryRecord extends RegistryRecord, TReturn> = (
//   container: MaterializedModuleEntries<TRegistryRecord>,
// ) => TReturn;

// export type DependencyResolverReturn<T extends DependencyResolver<any, any>> = T extends DependencyResolver<
//   any,
//   infer TReturn
// >
//   ? TReturn
//   : never;

// export type DependencyResolver<TKey extends string, TValue> = {
//   id: string | number;
//   key: TKey;
//   build(container: ModuleRegistry<any>, cache: ContainerCache, ctx): TValue;
//   // forEach(iterFn: (resolver: DependencyResolver<any, any>) => any);
//   onRegister?(events: ContainerEvents);
// };

export type DependencyResolver<TKey extends string, TValue> =
  | AbstractDependencyResolver<TKey, TValue>
  | AbstractRegistryDependencyResolver<TKey, TValue>;
