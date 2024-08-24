import { Container, container } from '../container/Container.js';

import { singleton, transient } from '../definitions/definitions.js';
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

function buildSingletonTree(
  times: number,
  depth: number,
  markEager: boolean,
  currentDepth = 0,
): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    if (markEager && currentDepth === depth) {
      definitions.push(
        singleton //
          .using(...buildSingletonTree(times, depth, markEager, (currentDepth += 1)))

          .fn((...args: any[]) => args),
      );
    } else {
      definitions.push(
        singleton //
          .using(...buildSingletonTree(times, depth, markEager, (currentDepth += 1)))
          .fn((...args: any[]) => args),
      );
    }
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
      transient //
        .using(...buildTransient(times, depth, (currentDepth += 1)))
        .fn((...args: any[]) => args),
    );
  }

  return definitions;
}

const singletonD: any = singleton.using(...buildSingletonTree(4, 10, false)).fn((...args) => args);
const transientD: any = transient.using(...buildTransient(3, 10)).fn((...args) => args);
const singletonWithEagerLeafD: any = singleton.using(...buildSingletonTree(4, 10, true)).fn((...args) => args);

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
