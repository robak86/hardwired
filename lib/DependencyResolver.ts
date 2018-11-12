import {nextId} from "./utils/fastId";
import {Container} from "./Container";
import {containerProxyAccessor} from "./container-proxy-accessor";

export type DependencyResolverFunction<CONT, CTX, VAL> = (container:CONT, context:CTX) => VAL;


//TODO: convert to fp kind of
export class DependencyResolver<CONT = any, CTX = any, V = any> {
    public id:string = nextId(); //TODO: not sure if necessary

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, V>) {}

    build(container:Container, ctx, cache) {
        return this.resolver(containerProxyAccessor(container, cache), ctx);
    }
}