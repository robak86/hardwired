export function shallowClone<T>(obj:T):T {
    return {...obj as any};
}

export function assoc<K extends string, V, O extends object>(key:K, value: V, obj:O): O & Record<K, V> {
    return {
        ...obj as any,
        [key]: value
    }
}