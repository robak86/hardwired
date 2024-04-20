import { EagerDefinitions } from '../EagerDefinitions.js';
import { DefinitionBuilder } from '../../builder/DefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import EventEmitter from 'node:events';
import { container } from '../../container/Container.js';
import { EagerDefinitionsInterceptor } from '../EagerDefinitionsInterceptor.js';

describe(`EagerDefinitions`, () => {
  const singleton = new DefinitionBuilder<[], LifeTime.singleton>([], LifeTime.singleton, {}, []);

  const eagerDefinitions = new EagerDefinitions();
  const eagerInterceptor = new EagerDefinitionsInterceptor(true, eagerDefinitions);

  beforeEach(() => {
    eagerDefinitions.clear();
  });

  it(`produces correct inverted dependencies`, async () => {
    const val1 = singleton.fn(() => 123);

    const consumer = singleton
      .annotate(eagerInterceptor.eager)
      .using(val1)
      .fn(val => val * 2);

    expect(eagerDefinitions.getInvertedDefinitions(val1.id)).toEqual([consumer]);
    expect(eagerDefinitions.getInvertedDefinitions(consumer.id)).toEqual([]);
  });

  it(`works`, async () => {
    const eventEmitterD = singleton.fn(() => {
      return new EventEmitter<{ onMessage: [number] }>();
    });

    const consumer1D = singleton
      .using(eventEmitterD)
      .annotate(eagerInterceptor.eager)
      .fn(val => {
        const messages: number[] = [];
        val.on('onMessage', value => messages.push(value));
        return messages;
      });

    const consumer2D = singleton
      .using(eventEmitterD)
      .annotate(eagerInterceptor.eager)
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

    expect(eagerDefinitions.getInvertedDefinitions(eventEmitterD.id)).toEqual([consumer1D, consumer2D]);
    expect(eagerDefinitions.getInvertedDefinitions(consumer1D.id)).toEqual([]);
  });
});
