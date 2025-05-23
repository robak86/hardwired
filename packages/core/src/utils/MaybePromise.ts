import { isThenable } from './IsThenable.js';

export interface IMaybePromiseLike<T> extends PromiseLike<T> {
  trySync(): T;
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): IMaybePromiseLike<TResult1 | TResult2>;

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): IMaybePromiseLike<T | TResult>;

  finally(onFinally?: (() => void) | null): IMaybePromiseLike<T>;
}

export class MaybePromise<T> implements IMaybePromiseLike<T> {
  static all<T extends readonly unknown[]>(values: [...{ [K in keyof T]: T[K] | Promise<T[K]> }]): MaybePromise<T> {
    const hasAsync = values.some(v => isThenable(v));

    if (!hasAsync) {
      return new MaybePromise(values as T);
    }

    return new MaybePromise(Promise.all(values) as Promise<T>);
  }

  private readonly value: T | Promise<T>;
  public readonly isSync: boolean;

  constructor(value: T | Promise<T>) {
    this.value = value;
    this.isSync = !isThenable(value);
  }

  static of<T>(value: T | Promise<T>): IMaybePromiseLike<T> {
    return new MaybePromise(value);
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | IMaybePromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | IMaybePromiseLike<TResult2>) | null,
  ): IMaybePromiseLike<TResult1 | TResult2> {
    if (!onFulfilled && !onRejected) {
      return this as IMaybePromiseLike<TResult1 | TResult2>;
    }

    if (this.isSync) {
      try {
        const result = onFulfilled?.(this.value as T);

        return new MaybePromise(result as TResult1 | Promise<TResult1>);
      } catch (err) {
        if (onRejected) {
          try {
            const result = onRejected(err);

            return new MaybePromise(result as TResult2 | Promise<TResult2>);
          } catch (e) {
            return new MaybePromise(e) as IMaybePromiseLike<TResult2>;
          }
        }

        return new MaybePromise(err) as IMaybePromiseLike<TResult2>;
      }
    }

    return new MaybePromise((this.value as Promise<T>).then(onFulfilled, onRejected));
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | IMaybePromiseLike<TResult>) | null,
  ): IMaybePromiseLike<T | TResult> {
    if (!onRejected) {
      return this;
    }

    if (this.isSync) {
      return new MaybePromise(onRejected(this.value)) as IMaybePromiseLike<T | TResult>;
    }

    return new MaybePromise(Promise.resolve(this.value).catch(onRejected));
  }

  finally(onFinally?: (() => void) | null): IMaybePromiseLike<T> {
    if (this.isSync) {
      onFinally?.();

      return this;
    }

    return new MaybePromise(Promise.resolve(this.value).finally(onFinally));
  }

  trySync(): T {
    if (!this.isSync) {
      throw new Error('Value is asynchronous');
    }

    return this.value as T;
  }
}
