

type FilterOtherThanStrings<T> = {
    [k in keyof T]: boolean
}

type A = 1 | "a" | true


type WTF = FilterOtherThanStrings<A>;


const a:WTF = {}