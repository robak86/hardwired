import { createResolverId } from '../utils/fastId';

export type ModuleId = {
  readonly id: string;
  readonly revision: string;
};

export const ModuleId = {
  build(): ModuleId {
    return {
      id: createResolverId(),
      revision: createResolverId(),
    };
  },
  next(m: ModuleId): ModuleId {
    return {
      id: m.id,
      revision: createResolverId(),
    };
  },
};
