import { action } from '../ActionBuilder.js';
// import { state } from '../StateBuilder.js';
import { container } from 'hardwired';

describe('StateBuilder', () => {
  // type SomeState = {
  //   value: string;
  // };
  //
  // describe(`effects`, () => {
  //   type ActionPayload = { param: string };
  //
  //   class MyClass {
  //     onMyAction = vi.fn((payload: ActionPayload) => {
  //       return 'onMyAction return value';
  //     });
  //   }
  //
  //   it(`calls registered effects`, async () => {
  //     const myAction = action<string, ActionPayload>().execute(function (param: string) {
  //       this.dispatch({ param });
  //     });
  //
  //     const onMyActionSpy = vi.fn();
  //
  //     const myState = state<SomeState>()
  //       .effect(myAction, onMyActionSpy)
  //       .init(function () {
  //         return { value: 'initialValue' };
  //       });
  //
  //     const [stateInstance, actionInstance] = container().getAll([myState, myAction]);
  //
  //     expect(stateInstance).toEqual({ value: 'initialValue' });
  //
  //     actionInstance('1st call');
  //     actionInstance('2nd call');
  //
  //     /*expect(onMyActionSpy).toHaveBeenNthCalledWith(1, { param: '1st call' });
  //     expect(onMyActionSpy).toHaveBeenNthCalledWith(2, { param: '2nd call' });*/
  //   });
  //
  //   it(`calls registered effects even if they are subscribed after the action was emitted`, async () => {
  //     const myAction = action<string, ActionPayload>().execute(function (param) {
  //       this.dispatch({ param });
  //     });
  //
  //     const onMyActionSpy = vi.fn();
  //
  //     const myState = state<SomeState>()
  //       .effect(myAction, onMyActionSpy)
  //       .init(() => ({ value: 'initialValue' }));
  //
  //     const cnt = container();
  //     const actionInstance = cnt.use(myAction);
  //
  //     actionInstance('1st call');
  //     actionInstance('2nd call');
  //
  //     const stateInstance = cnt.use(myState);
  //
  //     expect(onMyActionSpy).toHaveBeenCalledTimes(1);
  //     expect(onMyActionSpy).toHaveBeenCalledWith(stateInstance, { param: '2nd call' });
  //   });
  //
  //   it(`returns values to the action`, async () => {
  //     const myAction = action<string, any>().execute(async function (param: string) {
  //       const results = await this.dispatch({ param });
  //       await this.dispatch({ results });
  //     });
  //
  //     const onMyActionSpy = vi.fn(() => {
  //       return 'onMyAction return value';
  //     });
  //
  //     const myState = state<SomeState>()
  //       .effect(myAction, onMyActionSpy)
  //       .init(() => ({ value: 'initialValue' }));
  //
  //     const [stateInstance, actionInstance] = container().getAll([myState, myAction]);
  //
  //     await actionInstance('1st call');
  //
  //     expect(onMyActionSpy).toHaveBeenCalledTimes(2);
  //
  //     expect(onMyActionSpy).toHaveBeenNthCalledWith(1, stateInstance, { param: '1st call' });
  //     expect(onMyActionSpy).toHaveBeenNthCalledWith(2, stateInstance, { results: ['onMyAction return value'] });
  //   });
  // });
  //
  // describe(`action as iterator`, () => {
  //   it(`allows using async iterator producing multiple values`, async () => {
  //     type ActionPayload = { val: number };
  //
  //     const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  //
  //     const myAction = action<string, ActionPayload>().execute(async function (param: string) {
  //       for await (const val of [1, 2, 3, 4]) {
  //         await sleep(1);
  //         await this.dispatch({ val });
  //       }
  //
  //       await this.dispatch({ val: -1 });
  //     });
  //
  //     const myState = state<{ values: number[] }>()
  //       .effect(
  //         () => myAction,
  //         (state, result) => {
  //           state.values.push(result.val);
  //         },
  //       )
  //       .init(() => ({ values: [] }));
  //
  //     const [myStateInstance, myActionInstance] = container().getAll([myState, myAction]);
  //
  //     await myActionInstance('1st call');
  //
  //     expect(myStateInstance.values).toEqual([1, 2, 3, 4, -1]);
  //   });
  // });
});
