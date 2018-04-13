import {nextId} from "./utils/fastId";

export type DependencyResolverFunction<CONT, CTX, VAL> = (container:CONT, context:CTX) => VAL;

export class DependencyResolver<CONT = any, CTX = any, D = any> {
    public id:string = nextId();

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, D>) {}

    //Can be memoized at this level
    get(container, ctx) {
        return this.resolver(container, ctx);
    }
}