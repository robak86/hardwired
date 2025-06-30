import { describe, it } from 'vitest';

import { cascading, scoped, singleton, transient } from '../tokens.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';

describe(`cls`, () => {
  const singletonDefinition = singleton.token<string>('singletonDefinition');
  const transientDefinition = transient.token<string>('transientDefinition');
  const scopedDefinition = scoped.token<string>('scopedDefinition');
  const cascadingDefinition = cascading.token<string>('cascadingDefinition');

  const consumerSingleton = singleton.token<Consumer>('consumerSingleton');
  const consumerTransient = transient.token<Consumer>('consumerTransient');
  const consumerScoped = scoped.token<Consumer>('consumerScoped');
  const consumerCascading = cascading.token<Consumer>('consumerCascading');

  class Consumer {
    constructor(_str: string) {}
  }

  describe('singleton consumer', () => {
    it(`allows only other singletons`, async () => {
      configureContainer(c => {
        c.add(consumerSingleton).using(singletonDefinition).class(Consumer);

        try {
          // @ts-expect-error forbid scoped dependencies
          c.add(consumerSingleton).class(Consumer, transientDefinition);

          // @ts-expect-error forbid scoped dependencies
          c.add(consumerSingleton).class(Consumer, scopedDefinition);

          // @ts-expect-error forbid cascading dependencies
          c.add(consumerSingleton).class(Consumer, cascadingDefinition);
        } catch (err) {
          // noop adding the same consumerSingleton more than once throws an error
        }
      });
    });
  });

  describe(`cascading consumer`, () => {
    it(`forbids?`, async () => {
      configureContainer(c => {
        try {
          c.add(consumerCascading).using(singletonDefinition).class(Consumer);
          c.add(consumerCascading).using(cascadingDefinition).class(Consumer);

          // @ts-expect-error forbid transient dependencies
          c.add(consumerCascading).class(Consumer, transientDefinition);

          // @ts-expect-error forbid scoped dependencies
          c.add(consumerCascading).class(Consumer, scopedDefinition);
        } catch (err) {
          // noop adding the same consumerCascading more than once throws an error
        }
      });
    });
  });

  describe(`transient consumer`, () => {
    it(`accepts any other other lifetimes`, async () => {
      configureContainer(c => {
        try {
          c.add(consumerTransient).using(singletonDefinition).class(Consumer);
          c.add(consumerTransient).using(transientDefinition).class(Consumer);
          c.add(consumerTransient).using(scopedDefinition).class(Consumer);
          c.add(consumerTransient).using(cascadingDefinition).class(Consumer);
        } catch (err) {
          // noop adding the same consumerTransient more than once throws an error
        }
      });
    });
  });

  describe(`scoped consumer`, () => {
    it(`allows all dependencies`, async () => {
      configureContainer(c => {
        try {
          c.add(consumerScoped).using(singletonDefinition).class(Consumer);
          c.add(consumerScoped).using(scopedDefinition).class(Consumer);
          c.add(consumerScoped).using(cascadingDefinition).class(Consumer);

          // @ts-expect-error forbid transient dependencies
          c.add(consumerScoped).using(transientDefinition).class(Consumer);
        } catch (err) {
          // noop adding the same consumerScoped more than once throws an error
        }
      });
    });
  });
});
