import {Registry} from "./registry";
import {NotDuplicated} from "./Module";
import {Thunk} from "./utils/thunk";

// D extends DependenciesRegistry = {}, M extends ImportsRegistry = {}, C = {}

type Factory<T> = () => T;
type ImportsRegistry = Registry<ModuleDefinition<any, any>>
type DependenciesRegistry = Registry<Factory<any>>;

export type ModuleDefinition<I extends ImportsRegistry = {}, D extends DependenciesRegistry = {}> = {
    imports:I;
    declarations:D
}

// type ModuleDefinitionImports<T> = T extends ModuleDefinition<infer M> ? M : never;
// type ModuleDefinitionDeclarations<T> = T extends ModuleDefinition<any, infer D> ? D : never;


export type ModuleDefinitionWithNewImport<K extends string,
    MOD2 extends ModuleDefinition,
    I extends ImportsRegistry,
    D extends DependenciesRegistry> = ModuleDefinition<I & Record<K, MOD2>, D>;

export type ModuleDefinitionWithNewDeclaration<
    K extends string,
    VAL,
    I extends ImportsRegistry,
    D extends DependenciesRegistry> =
    ModuleDefinition<I,  D & Record<K, VAL>>


type ImportFn = <K extends string,
    M1 extends ModuleDefinition,
    I extends ImportsRegistry,
    D extends DependenciesRegistry,
    >(key:K, mod2:Thunk<M1>, module:ModuleDefinition<I, D>) => ModuleDefinitionWithNewImport<K, M1, I, D>

type DefineFn = <K extends string,
    V,
    MOD extends ModuleDefinition,
    I extends ImportsRegistry,
    D extends DependenciesRegistry,
    >(key:K, factory:(container:any, C1) => V, module:MOD) => ModuleDefinitionWithNewDeclaration<K, typeof factory, I, D>


const importFn:ImportFn = (key, mod2, module) => ({
    imports: Registry.set(key, mod2, module.imports),
    declarations: Registry.clone(module.declarations)
});

const defineFn:DefineFn = (key, factory, module)=> ({
    imports: Registry.clone(module.imports ),
    declarations: Registry.setFactory(key, factory, module.declarations)
});


type BuildFn = () => ModuleDefinition<{}, {}>;
const build = () => ({imports: {}, declarations: {}});


export const ModuleDefinition = {
    build,

    import: importFn,

    define<K extends string, V, MOD extends ModuleDefinition>(key:K, factory:(container:any, C1) => V, module:MOD):ModuleDefinitionWithNewDeclaration<K, typeof factory, MOD> {
        return {

        };
    }
};


const m1 = ModuleDefinition.build();


const m2 = ModuleDefinition.define('k1', () => true, m1);


const m4 = importFn('k1', m2, ModuleDefinition.build());

// m4.imports.k1.declarations.k1

// m4.declarations.k1
// m2.declarations.k1
//
//
const m3 = ModuleDefinition.import('m2', m2, m2);
//
// m3.imports.m2.declarations.k1
