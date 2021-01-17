export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};
