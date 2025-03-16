export class CompositeDisposable implements Disposable {
  private _disposables: Disposable[] = [];

  get count() {
    return this._disposables.length;
  }

  registerDisposable(disposable: Disposable) {
    this._disposables.push(disposable);
  }

  [Symbol.dispose]() {
    this._disposables.forEach(disposable => disposable[Symbol.dispose]());
    this._disposables.length = 0;
  }
}
