export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};

export type NoConstructorArgsClassType<TInstance> = {
  new (): TInstance;
};
