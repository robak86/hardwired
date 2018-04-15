import {Module} from "./Module";

export * from './Module';
export * from './MaterializedContainer'
export * from './IModule';
export * from './utils';

//TODO: make sure that there won't be any collisions!!!!
export function module(name:string):Module {
    return new Module(name);
}



//TODO: rename -> container??
export function hardwired() {
    const usedNames = [];

    function module(name:string):Module {
        return new Module(name);
    }

    return {module};
}

/*

import {container} from 'hardwired';






 */