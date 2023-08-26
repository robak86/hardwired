export interface Serializable<T> {
  restore(data: T): void;
  dump(): T;
}

export const isSerializable = (val: any): val is Serializable<any> => {
  return typeof val.restore === 'function' && typeof val.dump === 'function';
};
