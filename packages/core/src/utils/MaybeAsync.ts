import { isThenable } from './IsThenable.js';

type UnwrapMaybePromise<T> = T extends MaybeAsync<infer U> ? U : T extends Promise<infer U> ? U : T;

export class MaybeAsync<T> implements PromiseLike<T> {
  static null = MaybeAsync.resolve(null);

  static all<T extends readonly unknown[]>(values: [...T]): MaybeAsync<{ [K in keyof T]: UnwrapMaybePromise<T[K]> }> {
    let hasAsync = false;

    const unwrapped = values.map(v => {
      let current = v;

      // Unwrap nested MaybeAsyncs
      while (current instanceof MaybeAsync) {
        if (!current.isSync) hasAsync = true;

        current = current.value;
      }

      // If still a Promise, mark as async
      if (isThenable(current)) hasAsync = true;

      return current;
    });

    if (!hasAsync) {
      return MaybeAsync.resolve(unwrapped as any); // fully sync
    }

    return MaybeAsync.resolve(Promise.all(unwrapped) as any);
  }

  private readonly value: T | Promise<T>;

  // TODO: this can be used to trivially optimize definitions. If the final result isSync, we can skip
  //       MaybePromise completely an in next resolution use fully synchronous value.
  public readonly isSync: boolean;

  static resolve<T>(value: T | MaybeAsync<T> | Promise<T>): MaybeAsync<T> {
    if (value instanceof MaybeAsync) return value;

    return new MaybeAsync(value);
  }

  protected constructor(value: T | Promise<T>) {
    this.value = value;
    this.isSync = !isThenable(value) || (value instanceof MaybeAsync && value.isSync);
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

        return MaybeAsync.resolve(result as TResult1 | Promise<TResult1>);
      } catch (err) {
        if (onRejected) {
          try {
            const result = onRejected(err);

            return MaybeAsync.resolve(result as TResult2 | Promise<TResult2>);
          } catch (e) {
            return MaybeAsync.resolve(e) as MaybeAsync<TResult2>;
          }
        }

        return MaybeAsync.resolve(err) as MaybeAsync<TResult2>;
      }
    }

    return MaybeAsync.resolve((this.value as Promise<T>).then(onFulfilled, onRejected));
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | MaybeAsync<TResult>) | null,
  ): MaybeAsync<T | TResult> {
    if (!onRejected) {
      return this;
    }

    if (this.isSync) {
      return MaybeAsync.resolve(onRejected(this.value)) as MaybeAsync<T | TResult>;
    }

    return MaybeAsync.resolve(Promise.resolve(this.value).catch(onRejected));
  }

  finally(onFinally?: (() => void) | null): MaybeAsync<T> {
    if (this.isSync) {
      onFinally?.();

      return this;
    }

    return MaybeAsync.resolve(Promise.resolve(this.value).finally(onFinally));
  }

  trySync(): T {
    if (this.value instanceof MaybeAsync) {
      return this.value.trySync();
    }

    if (!this.isSync) {
      throw new Error('Value is asynchronous');
    }

    return this.value as T;
  }
}
