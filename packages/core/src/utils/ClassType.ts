// TODO: switch generics order to be consistent with Instance generics
export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};
