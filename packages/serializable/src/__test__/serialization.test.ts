import { describe, expect, it } from 'vitest';
import { container } from 'hardwired';
import { SerializationInterceptor } from '../interceptor/SerializationInterceptor.js';
import { Serializable } from '../abstract/Serializable.js';
import { serializable } from '../definitions/serializable.js';

describe(`serialization`, () => {
  class DummySerializable implements Serializable<any> {
    private _data?: any;

    constructor() {}

    restore(data: any) {
      this._data = data;
    }

    dump() {
      return this._data!;
    }
  }

  function setup() {
    const interceptor = new SerializationInterceptor();

    const cnt = container({
      interceptor,
    });

    return { interceptor, cnt };
  }

  describe(`class serialization`, () => {
    describe(`dump`, () => {
      it(`dumps serializable class definition`, async () => {
        const { interceptor, cnt } = setup();

        const def1 = serializable('someId', DummySerializable);
        const def2 = serializable('otherId', DummySerializable);

        cnt.use(def1).restore({ value: 1 });
        cnt.use(def2).restore({ value: 2 });

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
        const { interceptor, cnt } = setup();

        const def1 = serializable('someId', DummySerializable);
        const def2 = serializable('otherId', DummySerializable);

        cnt.use(def1).restore({ value: 1 });
        cnt.use(def2).restore({ value: 2 });

        const dump = interceptor.dumpJSON();

        const restoringInterceptor = new SerializationInterceptor(JSON.parse(dump));
        const cnt2 = container({ interceptor: restoringInterceptor });

        expect(cnt2.use(def1).dump()).toEqual({ value: 1 });
        expect(cnt2.use(def2).dump()).toEqual({ value: 2 });
      });
    });
  });
});
