// const state = <TInput, TEmit>(clbk: (this: any, ...args: any[]) => void): any => {};
// const action = <TInput, TEmit>(clbk: (this: any, ...args: any[]) => void): any => {};
// const singleton = (clbk: (this: any, ...args: any[]) => void): any => {};
// const singleton2 = (meta: any, clbk: (this: any, ...args: any[]) => void): any => {};
//
// type Input = {};
// type Emit = {};
//
// declare const otherAction: any;
//
// declare const using:any;
//
//
//
//
// //
// // const myState = state({dep1, dep2}, function (cnt, dispatcher) {
// //
// //   dispatcher.effect(otherAction, { someDef }, (state, deps) => {
// //     this.a;
// //     state.update(deps.someDef(123));
// //   });
// //
// //   dispatcher.effect(otherAction, { someDef }, ((state, deps) => {
// //
// //   });
// //
// //   return {};
// // });
// //
// // // !!!! TODO: replace builder pattern with this?
// // const myState = singleton({dep1, dep2, dep3, dep4, dep5}, function () {
// //   return new Class(this.dep1, this.dep2);
// // });
// //
// // const myStateV2 = singleton({dep1, dep2, dep3, dep4, dep5}, (deps) => {
// //   // here we can add initialization login !!!
// //   // deps.onEffect()
// //
// //
// //   return new Class(deps.dep1, deps.dep2);
// // });
// // // or
// //
// // const myStateV2 = using({dep1, dep2, dep3, dep4, dep5}).singleton(c => {
// //   // here we can add initialization login !!!
// //   // deps.onEffect()
// //
// //
// //   return myFunction(c.dep1, c.dep2);
// // });
// //
// // const myStateV2 = using({dep1, dep2, dep3, dep4, dep5}).scoped(c => {
// //   // here we can add initialization login !!!
// //   // deps.onEffect()
// //
// //
// //   return myFunction(c.dep1, c.dep2);
// // });
//
//
// // this function produces a definition builder. Allows adding extra built-in dependencies to this.buildInDef
// // const createDefinitionBuilder = ()
//
// const myAction = action<Input, Emit>(function () {
//   this.execute({ myState }, function (input: Input) {});
// });
//
// const someDef = singleton(container => {
//   const deps = container.use(myState, myAction);
//   // const deps = container.use({myState, myAction});
//   return new MyClass();
// });
//
// const someDef24 = singleton2({ meta: 123 }, container => {
//   const deps = container.use(myState, myAction);
//   // const deps = container.use({myState, myAction});
//   return new MyClass();
// });
//
// const someOtherDef = singleton(c => {
//   return new MyClass(c.use(myAction));
// });
//
// class MyClass {
//   constructor(...args: any[]) {}
// }
//
//
// const mixed = bind({someDef24, someOtherDef}).define(function (this: {a: number, otherState: any}) {
//
//   const state = {};
//
//
//
//
//   return {
//     action: () =>  {
//       this.a;
//     }
//   }
//
// })
