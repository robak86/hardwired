import { describe, expect, it } from 'vitest';
import { container } from 'hardwired';
import { HydrationInterceptor } from '../HydrationInterceptor.js';
import { HydrateAwareState } from '../HydrateAwareState.js';
import { hydratable } from '../hydratable.js';

describe(`serialization`, () => {
  class DummyHydratable implements HydrateAwareState<any> {
    private _data?: any;

    constructor() {}

    setState(data: any) {
      this._data = data;
    }

    get state() {
      return this._data!;
    }
  }

  describe(`class serialization`, () => {
    describe(`dump`, () => {
      it(`dumps serializable class definition`, async () => {
        const interceptor = new HydrationInterceptor();

        const cnt = container({
          interceptor,
        });

        const def1 = hydratable('someId', DummyHydratable);
        const def2 = hydratable('otherId', DummyHydratable);

        cnt.get(def1).setState({ value: 1 });
        cnt.get(def2).setState({ value: 2 });

        const dump = interceptor.dumpJSON();

        const parsed = JSON.parse(dump);
        expect(parsed).toEqual({
          someId: {
            value: 1,
          },
          otherId: {
            value: 2,
          },
        });
      });
    });

    describe(`restore`, () => {
      it(`restores instances state`, async () => {
        const interceptor = new HydrationInterceptor();

        const cnt = container({
          interceptor,
        });

        const def1 = hydratable('someId', DummyHydratable);
        const def2 = hydratable('otherId', DummyHydratable);

        cnt.get(def1).setState({ value: 1 });
        cnt.get(def2).setState({ value: 2 });

        const dump = interceptor.dumpJSON();

        const restoringInterceptor = new HydrationInterceptor(JSON.parse(dump));
        const cnt2 = container({ interceptor: restoringInterceptor });

        expect(cnt2.get(def1).state).toEqual({ value: 1 });
        expect(cnt2.get(def2).state).toEqual({ value: 2 });
      });
    });
  });
});
