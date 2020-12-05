export type ObjectPaths<TRecord extends Record<string, unknown>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Record<string, unknown> ? `${K}.${ObjectPaths<TRecord[K]>}` : K;
}[keyof TRecord & string];
