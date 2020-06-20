import { UnionToIntersection } from 'utility-types';

function path<T extends string | { name: string; type: T }, U extends [T, ...T[]]>(...fragments: U): U {
  return null as any;
}

function param<TKey extends string, T>(key: TKey): { name: TKey; type: T } {
  return null as any;
}

const a = path('a', param<'placeholder', number>('placeholder'), param<'placeholder2', string>('placeholder2'));

export type PathParam<TName extends string, TType> = { name: TName; type: TType };

// prettier-ignore
type PathParamEntry<T extends Array<PathParam<any, any> | string>, K extends keyof T> =
    T[K] extends string ? never :
        T[K] extends PathParam<any, any> ?  { [TName in T[K]['name']]:T[K]['type'] } : never

// prettier-ignore
type PathParamsArrayUnion<T extends Array<PathParam<any, any> | string>> = UnionToIntersection<{
    [K in keyof T]: PathParamEntry<T, K>
}[number]>;

type WTF = PathParamsArrayUnion<typeof a>;

const zzz: WTF = { placeholder: 2, placeholder2: 'sdf' };
