export type Option<T> = {
  get(): T | null | undefined;
  map<TNext>(fn: (value: T) => TNext): Option<TNext>;
  flatMap<TNext>(fn: (value: T) => Option<TNext>): Option<TNext>;
  isEmpty(): boolean;
  getOrElse(def: T): T;
};

export class Some<T> implements Option<T> {
  constructor(private value: T) {}

  get = (): T | null | undefined => {
    return this.value;
  };

  map = <TNext>(fn: (value: T) => TNext): Option<TNext> => {
    return Option(fn(this.value));
  };

  flatMap<TNext>(fn: (value: T) => Option<TNext>): Option<TNext> {
    return Option<TNext>(fn(this.value).get());
  }

  isEmpty = () => false;

  getOrElse = (def: T): T => this.value;
}

export class None<T> implements Option<T> {
  constructor(private value: null | undefined) {}

  get = (): T | null | undefined => {
    return this.value;
  };

  map = <TNext>(fn: (value: T) => TNext): Option<TNext> => {
    return this as any;
  };

  flatMap<TNext>(fn: (value: T) => Option<TNext>): Option<TNext> {
    return this as any;
  }

  isEmpty = () => true;

  getOrElse = (def: T): T => def;
}

export function Option<T>(value: T | null | undefined | Option<T>): Option<T> {
  if (value instanceof Some || value instanceof None) {
    return value;
  }

  if (value === null || value === undefined) {
    return new None<T>(value as any);
  }

  return new Some<T>(value as T);
}
