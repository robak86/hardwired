import { describe, it } from 'vitest';

import { cascading, scoped, singleton, transient } from '../def-symbol.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';

describe(`cls`, () => {
  const singletonDefinition = singleton<string>('singletonDefinition');
  const transientDefinition = transient<string>('transientDefinition');
  const scopedDefinition = scoped<string>('scopedDefinition');
  const cascadingDefinition = cascading<string>('cascadingDefinition');

  const consumerSingleton = singleton<Consumer>('consumerSingleton');
  const consumerTransient = transient<Consumer>('consumerTransient');
  const consumerScoped = scoped<Consumer>('consumerScoped');
  const consumerCascading = cascading<Consumer>('consumerCascading');

  class Consumer {
    constructor(_str: string) {}
  }

  describe('singleton consumer', () => {
    it(`allows only other singletons`, async () => {
      configureContainer(c => {
        c.add(consumerSingleton).class(Consumer, singletonDefinition);

        // @ts-expect-error forbid scoped dependencies
        c.add(consumerSingleton).class(Consumer, transientDefinition);

        // @ts-expect-error forbid scoped dependencies
        c.add(consumerSingleton).class(Consumer, scopedDefinition);

        // @ts-expect-error forbid cascading dependencies
        c.add(consumerSingleton).class(Consumer, cascadingDefinition);
      });
    });
  });

  describe(`cascading consumer`, () => {
    it(`forbids?`, async () => {
      configureContainer(c => {
        c.add(consumerCascading).class(Consumer, singletonDefinition);
        c.add(consumerCascading).class(Consumer, cascadingDefinition);

        // @ts-expect-error forbid transient dependencies
        c.add(consumerCascading).class(Consumer, transientDefinition);

        // @ts-expect-error forbid scoped dependencies
        c.add(consumerCascading).class(Consumer, scopedDefinition);
      });
    });
  });

  describe(`transient consumer`, () => {
    it(`accepts any other other lifetimes`, async () => {
      configureContainer(c => {
        c.add(consumerTransient).class(Consumer, singletonDefinition);
        c.add(consumerTransient).class(Consumer, transientDefinition);
        c.add(consumerTransient).class(Consumer, scopedDefinition);
        c.add(consumerTransient).class(Consumer, cascadingDefinition);
      });
    });
  });

  describe(`scoped consumer`, () => {
    it(`allows all dependencies`, async () => {
      configureContainer(c => {
        c.add(consumerScoped).class(Consumer, singletonDefinition);
        c.add(consumerScoped).class(Consumer, scopedDefinition);
        c.add(consumerScoped).class(Consumer, cascadingDefinition);

        // @ts-expect-error forbid transient dependencies
        c.add(consumerScoped).class(Consumer, transientDefinition);
      });
    });
  });
});
