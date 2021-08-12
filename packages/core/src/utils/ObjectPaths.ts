export type ObjectPaths<TRecord extends Record<string, unknown>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? `${K}.${ObjectPaths2<TRecord[K]>}` : K;
}[keyof TRecord & string];

export type ObjectPaths2<TRecord extends Record<string, unknown>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? never : K;
}[keyof TRecord & string];

// export type ObjectPaths3<TRecord extends Record<string, unknown>> = {
//   [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? never : K;
// }[keyof TRecord & string];
