import {nextId} from "./utils/fastId";

export class ModuleId {
    public id:string = nextId(); //TODO: extract it to Identity class (id: string, origin??: string;)

    constructor(public name:string,
                public identity:string = `module_${nextId()}`) {

    }

    withNextId():ModuleId {
        return new ModuleId(this.name, this.identity);
    }
}

export const moduleId = (name:string) => new ModuleId(name);