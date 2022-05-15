import { external } from '../../sync/external.js';
import { request, singleton, transient } from '../../definitions.js';
import { asyncClass } from '../asyncClass.js';
import { LifeTime } from '../../abstract/LifeTime.js';

describe(`asyncClass`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      class NumberConsumer {
        constructor(private value: number) {}
      }

      const ext = external('ext').type<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncClass(LifeTime.transient)(NumberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncClass(LifeTime.transient)(NumberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.asyncFn(async val => val, ext);
          asyncClass(LifeTime.transient)(NumberConsumer, dep);
        });
      });

      describe(`request`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncClass(LifeTime.request)(NumberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncClass(LifeTime.request)(NumberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncClass(LifeTime.request)(NumberConsumer, dep);
        });
      });

      describe(`singleton`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncClass(LifeTime.singleton)(NumberConsumer, dep);
          };

          expect(build).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncClass(LifeTime.request)(NumberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncClass(LifeTime.transient)(NumberConsumer, dep);
        });
      });
    });
  });
});
