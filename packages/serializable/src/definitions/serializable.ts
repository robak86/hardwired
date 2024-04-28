import { buildDefine, LifeTime } from 'hardwired';

export const serializable = (id: string) => {
  return buildDefine({
    lifeTime: LifeTime.singleton,
    buildMeta: (id: string) => {
      return { id };
    },
  });
};
