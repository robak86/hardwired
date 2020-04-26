import {nextId} from "../utils/fastId";
import {ContainerCache} from "../container/container-cache";
import {containerProxyAccessor} from "../container/container-proxy-accessor";
import {DependencyResolver, DependencyResolverFunction} from "./DependencyResolver";

export class RequestSingletonResolver<CONT, CTX = any, V = any> implements DependencyResolver<CONT, CTX, V> {
    public id:string = nextId(); //TODO: not sure if necessary

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, V>) {}

    build = (container, ctx, cache:ContainerCache) => {
        if (cache.hasInRequestScope(this.id)) {
            return cache.getFromRequestScope(this.id)
        } else {
            let instance = this.resolver(containerProxyAccessor(container, cache), ctx);
            cache.setForRequestScope(this.id, instance);
            return instance;
        }
    }
}