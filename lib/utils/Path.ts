import {get as loGet, set as loSet} from 'lodash';

export type Path<S> =
    | T1<S>
    | T2<S>
    | T3<S>
    | T4<S>
    | T5<S>
    | T6<S>
    | T7<S>
    | T8<S>
    | T9<S>
    | T10<S>

export type K1<T> = keyof T;
export type K2<T> = keyof T[K1<T>];
export type K3<T> = keyof T[K1<T>][K2<T>];
export type K4<T> = keyof T[K1<T>][K2<T>][K3<T>];
export type K5<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>];
export type K6<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>][K5<T>];
export type K7<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>][K5<T>][K6<T>];
export type K8<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>][K5<T>][K6<T>][K7<T>];
export type K9<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>][K5<T>][K6<T>][K7<T>][K8<T>];
export type K10<T> = keyof T[K1<T>][K2<T>][K3<T>][K4<T>][K5<T>][K6<T>][K7<T>][K8<T>][K9<T>];

export type T1<T> = [K1<T>];
export type T2<T> = [K1<T>, K2<T>];
export type T3<T> = [K1<T>, K2<T>, K3<T>];
export type T4<T> = [K1<T>, K2<T>, K3<T>, K4<T>];
export type T5<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>];
export type T6<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>, K6<T>];
export type T7<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>, K6<T>, K7<T>];
export type T8<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>, K6<T>, K7<T>, K8<T>];
export type T9<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>, K6<T>, K7<T>, K8<T>, K9<T>];
export type T10<T> = [K1<T>, K2<T>, K3<T>, K4<T>, K5<T>, K6<T>, K7<T>, K8<T>, K9<T>, K10<T>];

export type PathValue<S, P> =
    P extends T1<S> ? S[P[0]] :
        P extends T2<S> ? S[P[0]][P[1]] :
            P extends T3<S> ? S[P[0]][P[1]][P[2]] :
                P extends T4<S> ? S[P[0]][P[1]][P[2]][P[3]] :
                    P extends T5<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]] :
                        P extends T6<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]] :
                            P extends T7<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]] :
                                P extends T8<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]] :
                                    P extends T9<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]] :
                                        P extends T10<S> ? S[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]][P[9]] : never;


export function set<S extends object, P extends Path<S>>(obj:S, path:P, value:PathValue<S, P>) {
    loSet(obj, path, value);
}

export function get<S, P extends Path<S>>(obj:S, path:P, defaultValue:PathValue<S, P>):PathValue<S, P> {
    return loGet(obj, path, defaultValue);
}


export interface PathFunction<S> {
    <K extends keyof S>(p1:K):S[K]
    <K extends keyof S, K2 extends keyof S[K]>(p1:K, p2:K2):S[K][K2]
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(p1:K, p2:K2, p3:K3):S[K][K2][K3]
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3]>(p1:K, p2:K2, p3:K3, p4:K4):S[K][K2][K3][K4]


    // <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4]>(p1:K, p2:K2, p3:K3, p4:K4, p5:K5):PathValue<S, []>
    // <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4], K6 extends keyof S[K][K2][K3][K4][K5]>(p1:K, p2:K2, p3:K3, p4:K4, p5:K5, p6:K6):PathValue<S, []>
}


export interface TyppedGetter {
    <S, K extends keyof S>(obj:S, p1:K):S[K]
    <S, K extends keyof S, K2 extends keyof S[K]>(obj:S, p1:K, p2:K2):S[K][K2]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(obj:S, p1:K, p2:K2, p3:K3):S[K][K2][K3]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3]>(obj:S, p1:K, p2:K2, p3:K3, p4:K4):S[K][K2][K3][K4]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4]>(obj:S, p1:K, p2:K2, p3:K3, p4:K4, p5:K5):S[K][K2][K3][K4][K5]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4], K6 extends keyof S[K][K2][K3][K4][K5]>(obj:S, p1:K, p2:K2, p3:K3, p4:K4, p5:K5, p6:K6):S[K][K2][K3][K4][K5][K6]
}

export interface TyppedSetter {
    <S, K extends keyof S>(obj:S, val:S[K], p1:K):S[K]
    <S, K extends keyof S, K2 extends keyof S[K]>(obj:S, val:S[K][K2], p1:K, p2:K2):S[K][K2]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(obj:S, val:S[K][K2][K3], p1:K, p2:K2, p3:K3):S[K][K2][K3]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3]>(obj:S, val:S[K][K2][K3][K4], p1:K, p2:K2, p3:K3, p4:K4):S[K][K2][K3][K4]
    // <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4]>(obj: S, p1: K, p2: K2, p3: K3, p4: K4, p5: K5): S[K][K2][K3][K4][K5]
    // <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4], K6 extends keyof S[K][K2][K3][K4][K5]>(obj: S, p1: K, p2: K2, p3: K3, p4: K4, p5: K5, p6: K6): S[K][K2][K3][K4][K5][K6]
}

export interface TyppedUpsert {
    <S, K extends keyof S>(obj:S, upsert:(val:S[K] | undefined) => S[K], p1:K):S[K]
    <S, K extends keyof S, K2 extends keyof S[K]>(obj:S, upsert:(val:S[K][K2] | undefined) => S[K][K2], p1:K, p2:K2):S[K][K2]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(obj:S, upsert:(val:S[K][K2][K3] | undefined) => S[K][K2][K3], p1:K, p2:K2, p3:K3):S[K][K2][K3]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3]>(obj:S, upsert:(val:S[K][K2][K3][K4] | undefined) => S[K][K2][K3][K4], p1:K, p2:K2, p3:K3, p4:K4):S[K][K2][K3][K4]
    <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4]>(obj:S, upsert:(val:S[K][K2][K3][K4][K5] | undefined) => S[K][K2][K3][K4][K5], p1:K, p2:K2, p3:K3, p4:K4, p5:K5):S[K][K2][K3][K4][K5]
    // <S, K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4], K6 extends keyof S[K][K2][K3][K4][K5]>(obj: S, p1: K, p2: K2, p3: K3, p4: K4, p5: K5, p6: K6): S[K][K2][K3][K4][K5][K6]
}




export type TyppedPathFactory<S> = TyppedPathFunction<S, Path<S>>

export interface TyppedPathFunction<S, R> {
    <K extends keyof S>(p1:K):R
    <K extends keyof S, K2 extends keyof S[K]>(p1:K, p2:K2):R
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(p1:K, p2:K2, p3:K3):R
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3]>(p1:K, p2:K2, p3:K3, p4:K4):R
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4]>(p1:K, p2:K2, p3:K3, p4:K4, p5:K5):R
    <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2], K4 extends keyof S[K][K2][K3], K5 extends keyof S[K][K2][K3][K4], K6 extends keyof S[K][K2][K3][K4][K5]>(p1:K, p2:K2, p3:K3, p4:K4, p5:K5, p6:K6):R
}


export function TyppedPath<S>() {
    const pathArr = (path:Path<S>):Path<S> => path;
    const path = (...args) => args;
    return {pathArr, path: path as TyppedPathFactory<S>};
}