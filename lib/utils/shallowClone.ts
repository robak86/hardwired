export function shallowClone<T extends object>(obj:T):T {
    return {...obj as any};
}