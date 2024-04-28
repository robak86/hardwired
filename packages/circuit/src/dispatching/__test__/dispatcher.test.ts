import { container } from 'hardwired';
import { dispatcherD } from '../dispatcher.js';
import { action } from '../../builder/ActionBuilder.js';
import { vi } from 'vitest';

describe(`Dispatcher`, () => {
  // describe(`call`, () => {
  //   it(`returns the action return value`, async () => {
  //     const otherAction = action<number>().execute(function (input) {
  //       return input * 100;
  //     });
  //
  //     const myAction = action<number>().execute(async function (input: number) {
  //       return {
  //         own: input + 1,
  //         other: this.call(otherAction, input),
  //       };
  //     });
  //
  //     const dispatcher = container().use(dispatcherD);
  //     const result = await dispatcher.call(myAction, 1);
  //     expect(result).toEqual({ own: 2, other: 100 });
  //   });
  // });
  //
  // describe(`subscribe`, () => {
  //   it(`subscribes by the id`, async () => {
  //     const dispatcher = container().use(dispatcherD);
  //     const mySpy = vi.fn();
  //     dispatcher.subscribe('myId', mySpy);
  //
  //     dispatcher.bind('myId', 'default').dispatch('dispatched');
  //
  //     expect(mySpy).toHaveBeenCalledWith('dispatched');
  //   });
  // });
});
