import {ContainerCache} from "./container-cache";

export type DependencyResolverFunction<CONT, CTX, VAL> = (container:CONT, context:CTX) => VAL;


export interface DependencyResolver<CONT , CTX = any, V = any> {
    build(container:CONT, ctx, cache:ContainerCache)
}

