import EventEmitter from 'node:events';

import { describe, expect, it } from 'vitest';

import { container } from '../Container.js';
import { cascading, singleton, transient } from '../../definitions/def-symbol.js';

describe(`Container`, () => {
  describe(`acts like a function`, () => {
    it(`is callable like function`, async () => {
      const myDef = singleton<number>();

      const use = container.new(c => c.add(myDef).fn(() => 123));

      const instance = use(myDef);

      expect(instance).toEqual(123);
    });

    describe(`other methods`, () => {
      it(`provides use method`, async () => {
        const myDef = singleton<number>();

        const cnt = container.new(c => c.add(myDef).fn(() => 123));

        const instance = cnt.use(myDef);

        expect(instance).toEqual(123);
      });

      describe(`all`, () => {
        it(`returns correct instances`, async () => {
          const myDef1 = singleton<number>();
          const myDef2 = singleton<number>();

          const use = container.new(c => {
            c.add(myDef1).fn(() => 123);
            c.add(myDef2).fn(() => 456);
          });

          const [val1, val2] = await use.all(myDef1, myDef2);

          expect(val1).toEqual(123);
          expect(val2).toEqual(456);
        });

        it(`returns correct type for async instances`, async () => {
          const myDef1 = singleton<number>();
          const myDef2 = singleton<number>();

          const use = container.new(c => {
            c.add(myDef1).fn(async () => 123);
            c.add(myDef2).fn(() => 456);
          });

          const [val1, val2] = await use.all(myDef1, myDef2);

          expect(val1).toEqual(123);
          expect(val2).toEqual(456);
        });
      });

      describe('using locator', () => {
        it(`allows opening new scope for callback`, async () => {
          type EventMap = { req: [number] };

          interface IHandler {
            handle(val: number): number;
          }

          class Handler implements IHandler {
            handle(val: number): number {
              return val * 100;
            }
          }

          const pubSub = singleton<EventEmitter<EventMap>>();
          const handler = cascading<IHandler>();

          const cnt = container.new(c => {
            c.add(pubSub).locator(container => {
              const emitter = new EventEmitter<EventMap>();

              emitter.on('req', async value => {
                const scope = container.scope(scope => {
                  scope.add(handler).class(Handler);
                });

                const handlerInstance = await scope.use(handler);

                handlerInstance.handle(value);

                scope.dispose();
              });

              return emitter;
            });
          });

          const pubSubInstance = await cnt.use(pubSub);

          pubSubInstance.emit('req', 1);
        });
      });
    });
  });

  describe(`.useExisting`, () => {
    describe(`transient`, () => {
      it(`doesn't allow passing transient definition on the type level`, async () => {
        const t = transient<number>();

        const cnt = container.new();

        // @ts-expect-error - transient definition is not allowed
        cnt.useExisting(t);
      });
    });
  });
});
