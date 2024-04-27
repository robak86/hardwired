import { action } from '../ActionBuilder.js';
import { state } from '../StateBuilder.js';
import { container } from 'hardwired';

describe('StateBuilder', () => {
  describe(`effects`, () => {
    type ActionPayload = { param: string };

    class MyClass {
      onMyAction = vi.fn((payload: ActionPayload) => {
        return 'onMyAction return value';
      });
    }

    it(`calls registered effects`, async () => {
      const myAction = action<ActionPayload>().fn(function (param: string) {
        this.dispatch({ param });
      });

      const myState = state().effect('onMyAction', myAction).class(MyClass);
      const [stateInstance, actionInstance] = container().getAll([myState, myAction]);

      actionInstance('1st call');
      actionInstance('2nd call');

      expect(stateInstance.onMyAction).toHaveBeenNthCalledWith(1, { param: '1st call' });
      expect(stateInstance.onMyAction).toHaveBeenNthCalledWith(2, { param: '2nd call' });
    });

    it(`calls registered effects even if they are subscribed after the action was emitted`, async () => {
      const myAction = action<ActionPayload>().fn(function (param: string) {
        this.dispatch({ param });
      });

      class MyClass {
        onMyAction = vi.fn((payload: ActionPayload) => {});
      }

      const myState = state().effect('onMyAction', myAction).class(MyClass);
      const cnt = container();
      const actionInstance = cnt.get(myAction);

      actionInstance('1st call');
      actionInstance('2nd call');

      const stateInstance = cnt.get(myState);

      expect(stateInstance.onMyAction).toHaveBeenCalledTimes(1);
      expect(stateInstance.onMyAction).toHaveBeenCalledWith({ param: '2nd call' });
    });

    it(`returns values to the action`, async () => {
      const myAction = action<any>().fn(async function (param: string) {
        const results = await this.dispatch({ param });
        await this.dispatch({ results });
      });

      const myState = state().effect('onMyAction', myAction).class(MyClass);

      const [stateInstance, actionInstance] = container().getAll([myState, myAction]);

      await actionInstance('1st call');

      expect(stateInstance.onMyAction).toHaveBeenCalledTimes(2);

      expect(stateInstance.onMyAction).toHaveBeenNthCalledWith(1, { param: '1st call' });
      expect(stateInstance.onMyAction).toHaveBeenNthCalledWith(2, { results: ['onMyAction return value'] });
    });
  });

  describe(`action as iterator`, () => {
    it(`allows using async iterator producing multiple values`, async () => {
      type ActionPayload = { val: number };

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const myAction = action<ActionPayload>().fn(async function (param: string) {
        for await (const val of [1, 2, 3, 4]) {
          await sleep(1);
          await this.dispatch({ val });
        }

        await this.dispatch({ val: -1 });
      });

      const myState = state()
        .effect('onMyAction', () => myAction)
        .class(
          class {
            readonly values: number[] = [];

            onMyAction(val: ActionPayload) {
              this.values.push(val.val);
            }
          },
        );

      const [myStateInstance, myActionInstance] = container().getAll([myState, myAction]);

      await myActionInstance('1st call');

      expect(myStateInstance.values).toEqual([1, 2, 3, 4, -1]);
    });
  });
});
