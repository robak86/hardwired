import { external } from '../../sync/external';
import { request, singleton, transient } from '../../definitions';
import { asyncFn } from '../asyncFn';
import { LifeTime } from '../../abstract/LifeTime';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const ext = external('ext1').type<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncFn(LifeTime.transient)(numberConsumer, dep);
          };

          expect(build).toThrow('Externals with singleton life time are not supported');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncFn(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.asyncFn(async val => val, ext);
          asyncFn(LifeTime.transient)(numberConsumer, dep);
        });
      });

      describe(`request`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncFn(LifeTime.request)(numberConsumer, dep);
          };

          expect(build).toThrow('Externals with singleton life time are not supported');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncFn(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncFn(LifeTime.request)(numberConsumer, dep);
        });
      });

      describe(`singleton`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error singleton does not accept singleton dependencies with externals
            asyncFn(LifeTime.singleton)(numberConsumer, dep);
          };

          expect(build).toThrow('Externals with singleton life time are not supported');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.asyncFn(async val => val, ext);
          asyncFn(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          asyncFn(LifeTime.transient)(numberConsumer, dep);
        });
      });
    });
  });
});
