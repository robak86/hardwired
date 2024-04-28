import { Container, container } from '../container/Container.js';

import { singleton, transient } from '../definitions/definitions.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import 'source-map-support/register';
import Bench from 'tinybench';

const countTreeDepsCount = (definition: InstanceDefinition<any, any, any>): number => {
  if (definition.dependencies.length === 0) {
    return 1;
  }

  return definition.dependencies.reduce((acc, dep) => acc + countTreeDepsCount(dep), 1);
};

function buildSingletonTree(
  times: number,
  depth: number,

  currentDepth = 0,
): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(singleton(({ use }) => buildSingletonTree(times, depth, (currentDepth += 1)).map(use)));
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
      transient(c => {
        return buildTransient(times, depth, (currentDepth += 1)).map(c.use);
      }),
    );
  }

  return definitions;
}

const singletonD: any = singleton(({ use }) => {
  return buildSingletonTree(4, 10).map(use);
});
const transientD: any = transient(c => {
  return buildTransient(3, 10).map(c.use);
});
const singletonWithEagerLeafD: any = singleton(({ use }) => {
  const all = buildSingletonTree(4, 10).map(use);
  return all;
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
let eagerCnt: Container;

const bench = new Bench({
  time: 100,
  setup: () => {
    cnt = container();
    eagerCnt = container();
  },
  teardown: () => {
    cnt = container();
    eagerCnt = container();
  },
});

bench
  .add('no interceptor: singletonD', () => {
    cnt.use(singletonD);
  })
  .add('no interceptor: transientD', () => {
    cnt.use(transientD);
  })
  .add('eager: singletonD', () => {
    eagerCnt.use(singletonD);
  })
  .add('eager: transientD', () => {
    eagerCnt.use(transientD);
  })
  .add('eager with eager leafs: singletonD', () => {
    eagerCnt.use(singletonWithEagerLeafD);
  });

bench
  .warmup()
  .then(_ => bench.run())
  .then(_ => console.table(bench.table()));
