import {nextId} from "./utils/fastId";

export type ContainerCacheEntry = {
    // requestId:string;
    value:any;
}

export class ContainerCache {

    public requestScope:Record<string, ContainerCacheEntry> = {};

    constructor(public globalScope:Record<string, ContainerCacheEntry> = {}) {}

    setShared(uuid:string, instance:any) {
        this.globalScope[uuid] = {
            value: instance
        }
    }

    setLocal(uuid:string, instance:any) {
        this.globalScope[uuid] = {
            value: instance
        }
    }

    get(uuid) {
        return this.requestScope[uuid] || this.globalScope[uuid]
    }


    existsInCurrentRequest(uuid:string) {

    }

    forNewRequest():ContainerCache {
        return new ContainerCache({...this.globalScope});
    }
}