export type UnwrapMaybePromise<T> = T extends MaybeAsync<infer U> ? U : T extends Promise<infer U> ? U : T;

export abstract class MaybeAsync<T> implements PromiseLike<T> {
  static all<T extends readonly unknown[]>(values: [...T]): MaybeAsync<{ [K in keyof T]: UnwrapMaybePromise<T[K]> }> {
    let hasAsync = false;

    const unwrapped = values.map(v => {
      let current = v;

      // Unwrap nested MaybeAsync
      while (current instanceof MaybeAsync) {
        if (current instanceof AsyncMaybeAsync) hasAsync = true;

        current = (current as SyncMaybeAsync<unknown>).value ?? (current as AsyncMaybeAsync<unknown>).promise;
      }

      // If still a Promise, mark as async
      if (current instanceof Promise) hasAsync = true;

      return current;
    });

    if (!hasAsync) {
      return new SyncMaybeAsync(unwrapped as any);
    }

    return new AsyncMaybeAsync(Promise.all(unwrapped) as any);
  }

  static resolve<T>(value: T | MaybeAsync<T> | Promise<T>): MaybeAsync<T> {
    if (value instanceof MaybeAsync) return value;

    if (value instanceof Promise) {
      return new AsyncMaybeAsync(value);
    }

    return new SyncMaybeAsync(value as T);
  }

  static reject<T>(reason: any): MaybeAsync<T> {
    return new SyncMaybeAsync(reason, true);
  }

  abstract then<TResult1 = T, TResult2 = never>(
    onFulfilled?: (value: T) => TResult1 | MaybeAsync<TResult1> | Promise<TResult1>,
    onRejected?: (reason: any) => TResult2 | MaybeAsync<TResult2> | Promise<TResult2>,
  ): MaybeAsync<TResult1 | TResult2>;

  abstract catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | MaybeAsync<TResult>) | null,
  ): MaybeAsync<T | TResult>;

  abstract finally(onFinally?: (() => void) | null): MaybeAsync<T>;

  abstract trySync(): T;

  abstract unwrap(): T | Promise<T>;
}

export class SyncMaybeAsync<T> extends MaybeAsync<T> {
  constructor(
    readonly value: T,
    readonly isError = false,
  ) {
    super();
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: (value: T) => TResult1 | MaybeAsync<TResult1> | Promise<TResult1>,
    onRejected?: (reason: any) => TResult2 | MaybeAsync<TResult2> | Promise<TResult2>,
  ): MaybeAsync<TResult1 | TResult2> {
    if (!onFulfilled && !onRejected) {
      return this as MaybeAsync<TResult1 | TResult2>;
    }

    if (this.isError) {
      if (onRejected) {
        try {
          const result = onRejected(this.value as any);

          return MaybeAsync.resolve(result as TResult2 | Promise<TResult2>);
        } catch (e) {
          return new SyncMaybeAsync(e, true) as MaybeAsync<TResult2>;
        }
      }

      return this as unknown as MaybeAsync<TResult1 | TResult2>;
    }

    try {
      const result = onFulfilled?.(this.value as T);

      return MaybeAsync.resolve(result as TResult1 | Promise<TResult1>);
    } catch (err) {
      if (onRejected) {
        try {
          const result = onRejected(err);

          return MaybeAsync.resolve(result as TResult2 | Promise<TResult2>);
        } catch (e) {
          return new SyncMaybeAsync(e, true) as MaybeAsync<TResult2>;
        }
      }

      return new SyncMaybeAsync(err, true) as MaybeAsync<TResult2>;
    }
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | MaybeAsync<TResult>) | null,
  ): MaybeAsync<T | TResult> {
    if (!onRejected) {
      return this;
    }

    if (this.isError) {
      try {
        return MaybeAsync.resolve(onRejected(this.value));
      } catch (e) {
        return new SyncMaybeAsync(e, true) as MaybeAsync<TResult>;
      }
    }

    return this;
  }

  finally(onFinally?: (() => void) | null): MaybeAsync<T> {
    onFinally?.();

    return this;
  }

  trySync(): T {
    if (this.isError) {
      throw this.value as Error;
    }

    return this.value;
  }

  unwrap(): T {
    if (this.isError) {
      throw this.value as Error;
    }

    return this.value;
  }
}

export class AsyncMaybeAsync<T> extends MaybeAsync<T> {
  constructor(readonly promise: Promise<T>) {
    super();
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: (value: T) => TResult1 | MaybeAsync<TResult1> | Promise<TResult1>,
    onRejected?: (reason: any) => TResult2 | MaybeAsync<TResult2> | Promise<TResult2>,
  ): MaybeAsync<TResult1 | TResult2> {
    return new AsyncMaybeAsync(this.promise.then(onFulfilled, onRejected));
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | MaybeAsync<TResult>) | null,
  ): MaybeAsync<T | TResult> {
    if (!onRejected) {
      return this;
    }

    return new AsyncMaybeAsync(this.promise.catch(onRejected));
  }

  finally(onFinally?: (() => void) | null): MaybeAsync<T> {
    return new AsyncMaybeAsync(this.promise.finally(onFinally));
  }

  trySync(): T {
    throw new Error('Value is asynchronous');
  }

  unwrap(): Promise<T> {
    return this.promise;
  }
}

export const maybeAsyncNull = MaybeAsync.resolve(null);
