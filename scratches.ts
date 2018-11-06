type KV<K extends string, V> = { k:K, v:V }

type KV2<K extends string, V> = [K, V];


function add<ARR extends KV2<any, any>[]>(...args:ARR):ARR {
    return args;
}


const w = add(['k1', 1], ['k2', true]);



type Map2<T extends KV2<any, any>> = {
    [K in keyof T[0]]: T[1]
}

type Map3<T extends KV2<any, any>[]> = Map2<T[number]>;


type Wtf = Map3<(typeof w)>;

const a:Wtf = {k1: 1, k2: true}

//
// w[0][1] = 'sdf';
// w[1][1] = false;


// interface C {
//     "key"   : B,
//     "value" : string
// }
//
// interface KeyValueify<T> {
//     key: keyof T,
//     value: T[keyof T]
// }