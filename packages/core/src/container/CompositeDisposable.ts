export class CompositeDisposable implements Disposable {
  private _disposables: Disposable[] = [];

  constructor() {}

  get count() {
    return this._disposables.length;
  }

  registerDisposable(disposable: Disposable) {
    // if (this._isDisposed) {
    //   throw new Error('ContainerDisposer is disposed');
    // }

    this._disposables.push(disposable);
  }

  [Symbol.dispose]() {
    this._disposables.forEach(disposable => disposable[Symbol.dispose]());

    // this._isDisposed = true;
    // console.log('ContainerDisposer', this._disposables);
    this._disposables.length = 0;
  }
}
