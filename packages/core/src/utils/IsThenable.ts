export function isThenable<T>(value: any): value is Promise<T> {
  return typeof value?.then === 'function';
}
