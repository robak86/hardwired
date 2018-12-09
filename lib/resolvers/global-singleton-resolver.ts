import {nextId} from "../utils/fastId";
import {ContainerCache} from "../container-cache";
import {containerProxyAccessor} from "../container-proxy-accessor";
import {DependencyResolver, DependencyResolverFunction} from "../DependencyResolver";

export class GlobalSingletonResolver<CONT, CTX = any, V = any> implements DependencyResolver<CONT, CTX, V> {
    public id:string = nextId(); //TODO: not sure if necessary

    constructor(private resolver:DependencyResolverFunction<CONT, CTX, V>) {}

    build = (container, ctx, cache:ContainerCache) => {
        if (cache.hasInGlobalScope(this.id)) {
            return cache.getFromGlobalScope(this.id)
        } else {
            let instance = this.resolver(containerProxyAccessor(container, cache), ctx);
            cache.setForGlobalScope(this.id, instance);
            return instance;
        }
    }
}