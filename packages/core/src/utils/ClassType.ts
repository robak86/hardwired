// TODO: switch generics order to be consistent with Instance generics
export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};
