/**
 * for literal unions
 * @example Sub<'Y' | 'X', 'X'> // === 'Y'
 */
export type Sub<O extends string,
    D extends string> = {[K in O]:(Record<D, never> & Record<string, K>)[K]}[O]

/**
 * Remove the keys represented by the string union type D from the object type O.
 *
 * @example Omit<{a: number, b: string}, 'a'> // === {b: string}
 * @example Omit<{a: number, b: string}, keyof {a: number}> // === {b: string}
 */
export type Omit<O, D extends string> = Pick<O, Sub<keyof O, D>>