export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

export const cls = <TInstance, TConstructorArgs extends any[]>(klass: ClassType<TInstance, TConstructorArgs>) => {
  throw new Error('Implement me!');
};
