import { createResolverId } from '../utils/fastId';

export type ModuleId = {
  readonly name: string;
  readonly id: string;
};

export const ModuleId = {
  build(name: string): ModuleId {
    return {
      name,
      id: createResolverId(),
    };
  },
  next(m: ModuleId): ModuleId {
    return {
      name: m.name,
      id: createResolverId(),
    };
  },
};
