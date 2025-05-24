import { isThenable } from './IsThenable.js';

type UnwrapMaybePromise<T> = T extends MaybeAsync<infer U> ? U : T extends Promise<infer U> ? U : T;

export class MaybeAsync<T> implements PromiseLike<T> {
  static all<T extends readonly unknown[]>(values: [...T]): MaybeAsync<{ [K in keyof T]: UnwrapMaybePromise<T[K]> }> {
    let hasAsync = false;
    const unwrapped = values.map(v => {
      if (v instanceof MaybeAsync) {
        if (!v.isSync) hasAsync = true;

        return v.value as UnwrapMaybePromise<T[number]>;
      }

      if (isThenable(v)) hasAsync = true;

      return v;
    });

    if (!hasAsync) {
      return new MaybeAsync(unwrapped as any); // fully sync
    }

    return new MaybeAsync(Promise.all(unwrapped) as any);
  }

  private readonly value: T | Promise<T>;

  // TODO: this can be used to trivially optimize definitions. If the final result isSync, we can skip
  //       MaybePromise completely an in next resolution use fully synchronous value.
  public readonly isSync: boolean;

  constructor(value: T | Promise<T>) {
    this.value = value;
    this.isSync = !isThenable(value);
  }

  static of<T>(value: T | Promise<T>): MaybeAsync<T> {
    return new MaybeAsync(value);
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: (value: T) => TResult1 | MaybeAsync<TResult1> | Promise<TResult1>,
    onRejected?: (reason: any) => TResult2 | MaybeAsync<TResult2> | Promise<TResult2>,
  ): MaybeAsync<TResult1 | TResult2> {
    if (!onFulfilled && !onRejected) {
      return this as MaybeAsync<TResult1 | TResult2>;
    }

    if (this.isSync) {
      try {
        const result = onFulfilled?.(this.value as T);

        return new MaybeAsync(result as TResult1 | Promise<TResult1>);
      } catch (err) {
        if (onRejected) {
          try {
            const result = onRejected(err);

            return new MaybeAsync(result as TResult2 | Promise<TResult2>);
          } catch (e) {
            return new MaybeAsync(e) as MaybeAsync<TResult2>;
          }
        }

        return new MaybeAsync(err) as MaybeAsync<TResult2>;
      }
    }

    return new MaybeAsync((this.value as Promise<T>).then(onFulfilled, onRejected));
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | MaybeAsync<TResult>) | null,
  ): MaybeAsync<T | TResult> {
    if (!onRejected) {
      return this;
    }

    if (this.isSync) {
      return new MaybeAsync(onRejected(this.value)) as MaybeAsync<T | TResult>;
    }

    return new MaybeAsync(Promise.resolve(this.value).catch(onRejected));
  }

  finally(onFinally?: (() => void) | null): MaybeAsync<T> {
    if (this.isSync) {
      onFinally?.();

      return this;
    }

    return new MaybeAsync(Promise.resolve(this.value).finally(onFinally));
  }

  trySync(): T {
    if (!this.isSync) {
      throw new Error('Value is asynchronous');
    }

    return this.value as T;
  }
}
