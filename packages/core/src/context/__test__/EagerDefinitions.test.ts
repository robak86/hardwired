import { beforeEach } from 'vitest';
import { getEagerDefinitions } from '../EagerDefinitions.js';
import { DefinitionBuilder } from '../../builder/DefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import EventEmitter from 'node:events';
import { container } from '../../container/Container.js';

describe(`EagerDefinitions`, () => {
  const singleton = new DefinitionBuilder<[], LifeTime.singleton>([], LifeTime.singleton, {}, false);

  beforeEach(() => {
    getEagerDefinitions().clear();
  });

  it(`produces correct inverted dependencies`, async () => {
    const val1 = singleton.fn(() => 123);

    const consumer = singleton
      .eager()
      .using(val1)
      .fn(val => val * 2);

    expect(getEagerDefinitions().getInvertedDefinitions(val1.id)).toEqual([consumer]);
    expect(getEagerDefinitions().getInvertedDefinitions(consumer.id)).toEqual([]);
  });

  it(`works`, async () => {
    const eventEmitterD = singleton.fn(() => {
      return new EventEmitter<{ onMessage: [number] }>();
    });

    const consumer1D = singleton
      .using(eventEmitterD)
      .eager()
      .fn(val => {
        const messages: number[] = [];
        val.on('onMessage', value => messages.push(value));
        return messages;
      });

    const consumer2D = singleton
      .using(eventEmitterD)
      .eager()
      .fn(val => {
        const messages: number[] = [];
        val.on('onMessage', value => messages.push(value));
        return messages;
      });

    const producerD = singleton //
      .using(eventEmitterD)
      .fn(emitter => {
        return () => {
          return emitter.emit('onMessage', Math.random());
        };
      });

    container().get(producerD);

    expect(getEagerDefinitions().getInvertedDefinitions(eventEmitterD.id)).toEqual([consumer1D, consumer2D]);
    expect(getEagerDefinitions().getInvertedDefinitions(consumer1D.id)).toEqual([]);
  });
});
