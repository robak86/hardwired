import * as cls from 'cls-hooked';
import {
    AsyncDependenciesRegistry,
    container,
    Container,
    DependenciesRegistry,
    emptyContainer,
    ImportsRegistry, MaterializedModuleEntries,
    Module,
    module
} from "../index";
import {Namespace} from 'cls-hooked';

const ContainerKey = 'container';
const NamespaceKey = '__hardwired-context';
const context:Namespace = cls.createNamespace(NamespaceKey);

export const withContainer = <T>(fn:() => T):T => {
    return context.runAndReturn(() => {
        context.set(ContainerKey, emptyContainer({}));
        return fn();
    })
};


export const useMockedModules = <T>(modules:Module[], fn:() => T):T => {
    return context.runAndReturn(() => {
        const rootModule = module('root');
        const moduleWithMocks = modules.reduce((finalModule, mockedModule) => finalModule.inject(mockedModule), rootModule);
        context.set(ContainerKey, container(moduleWithMocks, {}));
        return fn();
    })
};

export const bindContainer = <T>(fn:() => T):() => T => {
    return () => withContainer(fn);
};

export const bindMockedContainer = <T>(modules:Module[], fn:() => T):() => T => {
    return () => useMockedModules(modules, fn);
};

export const useContainer = ():Container => {
    const container = context.get(ContainerKey);
    if (!container) {
        throw new Error(`Missing container for current context. Use 'withContainer'`)
    }
    return container;
};

export function useDependency<I1 extends ImportsRegistry,
    D2 extends DependenciesRegistry,
    AD2 extends AsyncDependenciesRegistry,
    K extends keyof MaterializedModuleEntries<I1, D2, AD2>>(module:Module<I1, D2>, key:K):MaterializedModuleEntries<I1, D2, AD2>[K] {
    const container = useContainer();
    return container.deepGet(module, key)
}