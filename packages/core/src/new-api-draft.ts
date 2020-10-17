import { ClassType } from "./utils/ClassType";

type Deps<TRegistry> = {
  [K in keyof TRegistry]: TRegistry[K] extends Mod<infer TChildRegistry> ? Deps<TChildRegistry> : K;
};


type PropType<T, Path> =
  string extends Path ? unknown :
    Path extends keyof T ? T[Path] :
      Path extends `${infer K}.${infer R}` ? K extends keyof T ? PropType<T[K], R> : unknown :
        unknown;


type MapPropTypes<TRegistry, TPaths> = {
  [K in keyof TPaths]: PropType<TRegistry, TPaths[K]>;
}

type R = {
  a: number,
  b: string
}

type ZZ = MapPropTypes<R, ['b']>

// const zzz:ZZ = [true]


type AllowedPath2<T> =  {
  [K in keyof T & string]: {
    [K2 in keyof T[K] & string]: `${K}.${keyof T[K] & string}.${keyof T[K][K2] & string}`
  }[keyof T[K] & string]
}[keyof T & string]

// const azasdf:AllowedPath<{a: {b: {c: 1, d: 2}}}> = 'a.b.c'

type AllowedPath<T> = keyof T | {
  [K in keyof T & string]: `${K}.${keyof T[K] & string}`
}[keyof T & string] | AllowedPath2<T>


export class Mod<TRegistry> {

  define<TKey extends string, TValue, TPath extends keyof TRegistry & string>(
    key: TKey,
    value: (deps: PropType<TRegistry, TPath>) => TValue,
  ): Mod<TRegistry & Record<TKey, TValue>>
  define<TKey extends string, TValue, TPath extends keyof TRegistry & string>(
    key: TKey,
    value: (deps: PropType<TRegistry, TPath>) => TValue,
    path: TPath
  ): Mod<TRegistry & Record<TKey, TValue>>
  define<TKey extends string, TValue, TPath extends keyof TRegistry & string>(
    key: TKey,
    value: (deps: PropType<TRegistry, TPath>) => TValue,
    path?: TPath
  ): Mod<TRegistry & Record<TKey, TValue>>{
    return null as any;
  }



  defineArr<TKey extends string, TValue, TPath extends AllowedPath<TRegistry>>(
    key: TKey,
    value: () => TValue,
  ): Mod<TRegistry & Record<TKey, TValue>>

  defineArr<TKey extends string, TValue, TPath extends AllowedPath<TRegistry>, TPaths extends [TPath, ...TPath[]]>(
    key: TKey,
    value: (...deps: MapPropTypes<TRegistry, TPaths>) => TValue,
    path: TPaths,
  ): Mod<TRegistry & Record<TKey, TValue>>
  defineArr<TKey extends string, TValue, TPath extends AllowedPath<TRegistry>, TPaths extends [TPath, ...TPath[]]>(
    key: TKey,
    value: (...deps: MapPropTypes<TRegistry, TPaths>) => TValue,
    path?: TPaths,
  ): Mod<TRegistry & Record<TKey, TValue>>
  // defineArr<TKey extends string, TValue, TPaths extends string[]>(
  //   key: TKey,
  //   value: (deps: MapPropTypes<TRegistry, TPaths>) => TValue,
  //   path?: TPaths
  // ): Mod<TRegistry & Record<TKey, TValue>>
  {
    return null as any;
  }
}

const a = new Mod<{}>();

const child = a.define('a', () => 'string')
const z = a.define('a', () => 'string').define('b', () => 123).define('nested', () => ({a: 1}))

type Shape = {a: {b: string}}

const wtf:  {[K in keyof Shape & string]: `${K}.${keyof Shape[K] & string}`}[keyof Shape] = 'a.b'

// z.define('b', (s: string) => 123, 'a')



const transient = <TDeps extends any[], TResult>(klass: ClassType<TDeps, TResult>) => (...deps:TDeps) => {
  throw new Error('implementm e')
};


class SomeClass  {
  constructor(a: boolean, b: string) {

  }
}



z.defineArr('b', transient(SomeClass), ['nested.a', 'b'])
// z.defineArr('b', (s: boolean, c: number) => 123, ['nested.a', 'b'])
