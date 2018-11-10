// types simplification

//TODO:!!!!
type Registry<I extends Record<string, any>, D extends Record<string, any>, AD extends Record<string, any>> = {
    imports:I,
    definitions:D,
    asyncDefinitions:AD
}

type ExtendRegistryImports<K extends string, V, T extends Registry<any, any, any>> = Registry<RegistryImports<T>, RegistryDefinitions<T> & Record<K, V>, RegistryAsyncDefinitions<T>>

type RegistryImports<T> = T extends Registry<infer I, any, any> ? I : never;
type RegistryDefinitions<T> = T extends Registry<any, infer D, any> ? D : never;
type RegistryAsyncDefinitions<T> = T extends Registry<any, any, infer AD> ? AD : never;


class Test<R extends Registry<{}, {}, {}>> {

    public registry: R;

    define<K extends string, V>(k:K, value:V):Test<ExtendRegistryImports<K, V, R>> {
        return null as any;
    }
}



const a = new Test().define('v1', 1).define('v2', 2);

const z = a.registry.definitions.v1;
const z = a.registry.definitions.v2;
