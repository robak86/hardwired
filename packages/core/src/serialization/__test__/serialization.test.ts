import { describe, expect, it } from 'vitest';
import { container } from '../../container/Container.js';
import { SerializationInterceptor } from '../SerializationInterceptor.js';
import { singleton } from '../../definitions/definitions.js';
import { Serializable } from '../../definitions/abstract/Serializable.js';

describe(`serialization`, () => {
  class DummySerializable<T extends object> implements Serializable<T> {
    private data?: T;

    constructor() {}

    set(data: T) {
      this.data = data;
    }

    deserialize(data: string) {
      this.data = JSON.parse(data);
    }

    serialize(data: any): string {
      return JSON.stringify(this.data);
    }
  }

  describe(`class serialization`, () => {
    describe(`dump`, () => {
      it(`dumps serializable class definition`, async () => {
        const cnt = container({
          interceptor: new SerializationInterceptor(),
        });

        const def1 = singleton.serializableClass('someId', DummySerializable);
        const def2 = singleton.serializableClass('otherId', DummySerializable);

        cnt.get(def1).set({ value: 1 });
        cnt.get(def2).set({ value: 2 });
      });
    });
  });
});
