import { createModuleId } from '../utils/fastId';
import { v4 } from 'uuid';

export type ModuleId = {
  readonly id: string;
  // readonly revision: string;
};

export const ModuleId = {
  build(): ModuleId {
    return {
      id: createModuleId(),
      // revision: createModuleId(),
    };
  },
  next(m: ModuleId): ModuleId {
    return {
      id: m.id,
      // revision: createModuleId(),
    };
  },
};
