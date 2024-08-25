import { Container, container } from '../container/Container.js';

import { fn } from '../definitions/definitions.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import 'source-map-support/register';
import Bench from 'tinybench';

import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

const countTreeDepsCount = (definition: AnyInstanceDefinition<any, any, any>): number => {
  if (definition.dependencies.length === 0) {
    return 1;
  }

  return definition.dependencies.reduce((acc, dep) => acc + countTreeDepsCount(dep), 1);
};

function buildSingletonTree(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.singleton(use => {
        return use.all(...buildSingletonTree(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

function buildTransient(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn(use => {
        return use.all(...buildTransient(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

const singletonD = fn.singleton(use => {
  return use.all(...buildSingletonTree(4, 10));
});

const transientD = fn(use => {
  return use.all(...buildTransient(3, 10));
});

const singletonWithEagerLeafD = fn.singleton(use => {
  return use.all(...buildSingletonTree(4, 10));
});

console.table([
  { 'Definition Name': 'singletonD', 'Total Dependencies Count': countTreeDepsCount(singletonD) },
  { 'Definition Name': 'transientD', 'Total Dependencies Count': countTreeDepsCount(transientD) },
  {
    'Definition Name': 'singletonWithEagerLeafD',
    'Total Dependencies Count': countTreeDepsCount(singletonWithEagerLeafD),
  },
]);

let cnt: Container;

const bench = new Bench({
  time: 100,
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
