import invariant from 'tiny-invariant';

export class ControlledPromise<T> implements PromiseLike<T> {
  private promise: Promise<T>;
  private _resolve: (val: T) => void = () => {
    throw new Error('Race condition for resolve');
  };
  private _reject: (err) => void = () => {
    throw new Error('Race condition for reject');
  };
  private isFrozen = false;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  then<TResult1 = T, TResult2 = never>(
    onFulFilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onFulFilled, onRejected);
  }

  catch<TResult2 = never>(
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<T | TResult2> {
    return this.promise.then(val => val, onRejected);
  }

  resolve(value: T) {
    invariant(!this.isFrozen, `Promise is already resolved`);
    this._resolve(value);
    this.isFrozen = true;
  }

  reject(err: unknown) {
    invariant(!this.isFrozen, `Promise is already resolved`);
    this._reject(err);
    this.isFrozen = true;
  }
}
