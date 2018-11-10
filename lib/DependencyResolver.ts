import {nextId} from "./utils/fastId";

export type DependencyResolverFunction<CONT, CTX, VAL> = (container:CONT, context:CTX) => VAL;

export class DependencyResolver<CONT = any, CTX = any, D = any> {
    public id:string = nextId(); //TODO: not sure if necessary

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, D>) {}

    build(container, ctx) {
        return this.resolver(container, ctx);
    }
}