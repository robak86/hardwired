import { external } from '../../sync/external';
import { request, singleton, transient } from '../../definitions';
import { asyncFn } from '../asyncFn';
import { LifeTime } from '../../abstract/LifeTime';
import { asyncPartial } from '../asyncPartial';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const ext = external<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const dep = singleton.asyncFn(async val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.transient)(numberConsumer, dep);
        });
      });

      describe(`request`, () => {
        it(`does not accept singletons with externals`, async () => {
          const dep = singleton.asyncFn(async val => val, ext);

          // @ts-expect-error transient does not accept singleton dependencies with externals
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncPartial(LifeTime.request)(numberConsumer, dep);
        });
      });

      describe(`singleton`, () => {
        it(`does not accept singletons with externals`, async () => {
          const dep = singleton.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.singleton)(numberConsumer, dep);
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncPartial(LifeTime.singleton)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncPartial(LifeTime.singleton)(numberConsumer, dep);
        });
      });
    });
  });
});