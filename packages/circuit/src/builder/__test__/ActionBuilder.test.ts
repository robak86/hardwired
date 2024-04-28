import { apply, container, value } from 'hardwired';
import { action } from '../ActionBuilder.js';
import { dispatcherD } from '../../dispatching/dispatcher.js';

describe(`ActionBuilder`, () => {
  describe(`bind`, () => {
    it(`binds provided definitions`, async () => {
      const dependency = value(123);

      const myAction = action<number, any>()
        .bind({ dependency })
        // .concurrencyGroup(input => input.toString())
        .execute(async function (inputParam: number) {
          this.dispatch({
            id: 1,
            dependency: this.dependency,
            inputParam,
          });

          this.dispatch({
            id: 2,
            dependency: this.dependency,
            inputParam,
          });
        });

      const [dispatcher, actionInstance] = container([
        apply(dispatcherD, dispatcher => {
          // vi.spyOn(dispatcher, 'dispatch');
          // vi.spyOn(dispatcher, 'abort');
        }),
      ]).useAll(dispatcherD, myAction);

      await actionInstance(456);
      //
      // expect(dispatcher.dispatch).toHaveBeenNthCalledWith(1, {
      //   id: 1,
      //   dependency: 123,
      //   inputParam: 456,
      // });
      //
      // expect(dispatcher.dispatch).toHaveBeenNthCalledWith(2, {
      //   id: 2,
      //   dependency: 123,
      //   inputParam: 456,
      // });
    });
  });

  describe(`dispatching error`, () => {
    it(`breaks evaluation of the action`, async () => {
      const myAction = action<number, any>().execute(function (inputParam: number) {
        this.abort({
          message: 'someError',
        });

        this.dispatch({
          id: 1,
        });
      });

      const [dispatcher, actionInstance] = container([
        apply(dispatcherD, dispatcher => {
          // vi.spyOn(dispatcher, 'dispatch');
          // vi.spyOn(dispatcher, 'abort');
        }),
      ]).useAll(dispatcherD, myAction);

      actionInstance(456);

      // expect(dispatcher.dispatch).not.toHaveBeenCalled();
    });
  });
});
