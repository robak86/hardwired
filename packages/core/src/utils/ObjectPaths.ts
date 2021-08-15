export type ObjectPaths<TRecord extends Record<string, unknown>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? `${K}.${ObjectPathsL2<TRecord[K]>}` : K;
}[keyof TRecord & string];

// Using hardcoded second level paths to break recursion in order to limit available paths to closest collaborators
export type ObjectPathsL2<TRecord extends Record<string, unknown>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? never : K;
}[keyof TRecord & string];
