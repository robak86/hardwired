import { Container, container } from '../container/Container.js';

import { singleton, transient } from '../definitions/definitions.js';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition.js';
import 'source-map-support/register';
import Bench from 'tinybench';

function buildSingletonTree(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      singleton(c => {
        return buildSingletonTree(times, depth, (currentDepth += 1)).map(c.use);
      }),
    );
  }

  return definitions;
}

function buildTransientTree(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      transient(c => {
        return buildTransientTree(times, depth, (currentDepth += 1)).map(c.use);
      }),
    );
  }

  return definitions;
}

const singletonD: any = singleton(c => {
  return buildSingletonTree(4, 10).map(c.use);
});
const transientD: any = transient(c => {
  return buildTransientTree(4, 10).map(c.use);
});

let cnt: Container;

const bench = new Bench({
  time: 100,
  warmupTime: 100,
  setup: () => {
    cnt = container();
  },
  teardown: () => {
    cnt = container();
  },
});

bench
  .add('no interceptor: singletonD', () => {
    cnt.use(singletonD);
  })
  .add('no interceptor: transientD', () => {
    cnt.use(transientD);
  });

bench
  .warmup()
  .then(_ => bench.run())
  .then(_ => console.table(bench.table()));
