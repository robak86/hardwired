import { implicit } from '../../sync/external.js';
import { request, singleton, transient } from '../../definitions.js';
import { asyncFn } from '../asyncFn.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { describe, expect, it } from 'vitest';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const ext = implicit<number>('ext1');

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const build = () => {
            const dep = singleton.asyncFn(async val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            asyncFn(LifeTime.transient)(numberConsumer, dep);
          };

          expect(build).toThrow('Cannot use scoped dependency for singleton definition.');
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

          expect(build).toThrow('Cannot use scoped dependency for singleton definition.');
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

          expect(build).toThrow('Cannot use scoped dependency for singleton definition.');
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
