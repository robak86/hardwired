export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : 'Module contains duplicated definitions';
export type NotDuplicatedKeys<TSource, TTarget, TReturn> = Extract<keyof TSource, keyof TTarget> extends never
  ? TReturn
  : 'Module contains duplicated definitions';

// export type NextModuleImport<
//   TImportKey extends string,
//   V extends RegistryRecord,
//   R extends RegistryRecord
// > = NotDuplicated<
//   TImportKey,
//   R,
//   Module<R & { [K in TImportKey]: Module<V> } & ModuleRegistryContext<V>>
//   // Module<{ [K in keyof (R & { [K in TImportKey]: V })]: (R & { [K in TImportKey]: V })[K] }>
// >;
// export type ClassType<TConstructorArgs extends any[], TInstance> = {
//   new (...args: TConstructorArgs): TInstance;
// };
export type FilterPrivateFields<T> = T extends Function
  ? T
  : {
      [K in keyof T]: T[K];
    };
