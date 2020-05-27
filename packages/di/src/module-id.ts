import { createResolverId } from "./utils/fastId";

export type ModuleId = {
    name:string,
    id:string,
    identity:string
}
export const ModuleId = {
    build(name:string):ModuleId {
        return {
            name,
            id: createResolverId(),
            identity: `module_${createResolverId()}`
        }
    },
    next(m:ModuleId):ModuleId {
        return {
            name: m.name,
            id: createResolverId(),
            identity: m.identity
        }
    }
};
