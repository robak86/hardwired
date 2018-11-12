import {Container} from "./Container";


export function containerProxyAccessor(container:Container, cache = {}) {
    return new Proxy({} as any, {
        get(target, property:string) {
            let returned = container.getChild(cache, property); //TODO: getChild is private and it should stay private - solve this
            return returned;
        }
    })
}