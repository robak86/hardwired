export class PushPromise<T> {
  resolve!: (value: T | Promise<T>) => void;
  public readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject('timeout'); // TODO: add correct errors handling
      }, 10000);
    });
  }

  get(): Promise<T> {
    return this.promise;
  }

  push(value: T | Promise<T>) {
    if (!this.resolve) {
      throw new Error('race condition related to promise constructor');
    }

    this.resolve(value);
  }
}
