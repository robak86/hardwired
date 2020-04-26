import {nextId} from "../utils/fastId";
import {Container} from "../container/Container";
import {containerProxyAccessor} from "../container/container-proxy-accessor";

export type DependencyResolverFunction<CONT, CTX, VAL> = (container:CONT, context:CTX) => VAL;


//TODO: convert to fp kind of
export class ExpressHandlerResolver<CONT = any, CTX = any, V = any> {
    public id:string = nextId(); //TODO: not sure if necessary

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, V>) {}

    build(container:Container, ctx, cache) { //TODO: cache should be wrapped inside RequestObject. It can served as request context
        container.checkout(false);

        return this.resolver(containerProxyAccessor(container, cache), ctx);
    }
}
