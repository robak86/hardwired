import { buildDefine, LifeTime, DefineFn } from 'hardwired';

type SerializableDefineFn = DefineFn<LifeTime.singleton, { id: string }, {}, [string]>;

export const serializable: any = <TInstance>(...args: any[]) => {
  // return buildDefine({
  //   lifeTime: LifeTime.singleton,
  //   buildMeta: (id: string) => {
  //     return { id };
  //   },
  // })<TInstance>;
};
