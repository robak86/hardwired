export function isPromise(value: any): value is Promise<unknown> {
  return Boolean(value && typeof value.then === 'function');
}
