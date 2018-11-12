import {Container} from "./Container";

export interface Resolver<CONTAINER, OUT> {
    build(container:Container, cache)
}