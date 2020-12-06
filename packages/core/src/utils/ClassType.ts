export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};
