import { deflateRawSync } from 'zlib';
import { external } from '../../sync/external';
import { request, singleton, transient } from '../../definitions';
import { asyncClass } from '../asyncClass';
import { LifeTime } from '../../abstract/LifeTime';

describe(`asyncClass`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      class NumberConsumer {
        constructor(private value: number) {}
      }


      const ext = external<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const dep = singleton.asyncFn(async val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          asyncClass(LifeTime.transient)(NumberConsumer, dep);
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
          const dep = singleton.asyncFn(async val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          asyncClass(LifeTime.request)(NumberConsumer, dep);
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
          const dep = singleton.asyncFn(async val => val, ext);
          asyncClass(LifeTime.singleton)(NumberConsumer, dep);
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncClass(LifeTime.singleton)(NumberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncClass(LifeTime.singleton)(NumberConsumer, dep);
        });
      });
    });
  });
});
