import { LifeTime, DefineFn } from 'hardwired';

export const serializable: any = <TInstance>(...args: any[]) => {
  // return buildDefine({
  //   lifeTime: LifeTime.singleton,
  //   buildMeta: (id: string) => {
  //     return { id };
  //   },
  // })<TInstance>;
};
