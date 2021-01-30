import { createResolverId } from '../utils/fastId';

export type ModuleId = {
  readonly id: string;
};

export const ModuleId = {
  build(): ModuleId {
    return {
      id: createResolverId(),
    };
  },
  next(m: ModuleId): ModuleId {
    return {

      id: createResolverId(),
    };
  },
};
