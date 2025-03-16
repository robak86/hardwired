const runCount = 1_000;

let count = 0;

class TestDisposable {
  private _bigArray = new Array(1_000);

  constructor() {
    count += 1;
    console.log('created', count);
  }

  [Symbol.dispose]() {
    console.log('destroyed', count);
    count -= 1;
  }
}

// for (let i = 0; i < 1_000; i++) {
//   new TestDisposable();
// }

//
// const singletonD = fn.scoped(() => new TestDisposable());
// const transientD = fn(() => new TestDisposable());
// const scopedD = fn.scoped(() => new TestDisposable());
//
// function main() {
//   console.log('main');
//   const cnt = container.new();
//
//   cnt.use(singletonD);
//   cnt.use(scopedD);
//   cnt.use(transientD);
//
//   for (let i = 0; i < runCount; i++) {
//     let scope1 = cnt.scope();
//
//     scope1.use(singletonD);
//     scope1.use(scopedD);
//     scope1.use(transientD);
//
//     scope1 = null;
//
//     // const scope2 = scope1.scope(s => {
//     //   s.cascade(scopedD);
//     // });
//     //
//     // scope2.use(singletonD);
//     // scope2.use(scopedD);
//     // scope2.use(transientD);
//   }
// }
//
// main();
//
// // global.gc();
//
// setInterval(() => {
//   console.log(count);
// }, 1000);

// await vi.waitFor(async () => {
//   await runGC();
//   expect(count).toBe(0);
// });

// class MyDisposable {
//   constructor(private _disposeFn: (...args: any[]) => unknown) {}
//
//   [Symbol.dispose]() {
//     this._disposeFn();
//   }
// }
//
// const scopedDef = fn.scoped(
//   () =>
//     new MyDisposable(() => {
//       console.log('disposed');
//     }),
// );
//
// function main() {
//   for (let i = 0; i < 1_000; i++) {
//     cnt.scope().scope().scope().use(scopedDef);
//     console.log(cnt.stats.childScopes);
//   }
//
//   console.log(cnt.stats.childScopes);
// }
//
// main();
//
// setTimeout(() => {
//   console.log(cnt.stats.childScopes);
// }, 10_000);
