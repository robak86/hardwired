import {IModule, MaterializedModule2, ModulesRegistry} from "./utils/IModule";
import {PathFunction} from "./utils";

export class MaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {
    constructor(private ownDeclarations:D,
                private imports:M,
                private context:C) {}

    get:PathFunction<MaterializedModule2<D, M>> = (...args:any[]) => {

    }
}