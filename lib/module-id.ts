import {nextId} from "./utils/fastId";

export class ModuleId {
    //TODO: consider adding version property and increment it after each "mutation" ?! Could be valuable for inject and determining
    // ...or basically rename id to versionId
    public id:string = nextId(); //TODO: extract it to Identity class (id: string, origin??: string;)

    constructor(public name:string,
                public identity:string = `module_${nextId()}`) {

    }

    withNextId():ModuleId {
        return new ModuleId(this.name, this.identity);
    }
}

export const moduleId = (name:string) => new ModuleId(name);