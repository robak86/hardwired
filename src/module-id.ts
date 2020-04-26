import { nextId } from "./utils/fastId";

export type ModuleId = {
    name:string,
    id:string,
    identity:string
}
export const ModuleId = {
    build(name:string):ModuleId {
        return {
            name,
            id: nextId(),
            identity: `module_${nextId()}`
        }
    },
    next(m:ModuleId):ModuleId {
        return {
            name: m.name,
            id: nextId(),
            identity: m.identity
        }
    }
};