import { Container, container } from '../container/Container.js';

import { singleton, transient } from '../definitions/definitions.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import 'source-map-support/register';
import Bench from 'tinybench';
import { EagerDefinitionsInterceptor } from '../eager/EagerDefinitionsInterceptor.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

const eagerInterceptor = new EagerDefinitionsInterceptor();

const countTreeDepsCount = (definition: AnyInstanceDefinition<any, any>): number => {
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
): InstanceDefinition<number, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    if (markEager && currentDepth === depth) {
      definitions.push(
        singleton //
          .using(...buildSingletonTree(times, depth, markEager, (currentDepth += 1)))
          .annotate(eagerInterceptor.eager)
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

function buildTransient(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any>[] {
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

// console.log('singletonD', countTreeDepsCount(singletonD));
// console.log('transientD', countTreeDepsCount(transientD));
// console.log('singletonWithEagerLeafD', countTreeDepsCount(singletonWithEagerLeafD));

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
    eagerCnt = container({ interceptor: eagerInterceptor });
  },
  teardown: () => {
    cnt = container();
    eagerCnt = container({ interceptor: eagerInterceptor });
  },
});

bench
  .add('no interceptor: singletonD', () => {
    cnt.get(singletonD);
  })
  .add('no interceptor: transientD', () => {
    cnt.get(transientD);
  })
  .add('eager: singletonD', () => {
    eagerCnt.get(singletonD);
  })
  .add('eager: transientD', () => {
    eagerCnt.get(transientD);
  })
  .add('eager with eager leafs: singletonD', () => {
    eagerCnt.get(singletonWithEagerLeafD);
  });

bench
  .warmup()
  .then(_ => bench.run())
  .then(_ => console.table(bench.table()));
