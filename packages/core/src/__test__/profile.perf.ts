import { Container, container } from '../container/Container.js';

import { singleton, transient } from '../definitions/definitions.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import 'source-map-support/register';
import Bench from 'tinybench';
import { EagerDefinitionsInterceptor } from '../context/EagerDefinitionsInterceptor.js';

const eagerInterceptor = new EagerDefinitionsInterceptor();

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

const singletonD: any = singleton.fn((...args) => args, ...buildSingletonTree(4, 10, false));
const transientD: any = transient.fn((...args) => args, ...buildTransient(3, 10));
const singletonWithEagerLeafD: any = singleton.fn((...args) => args, ...buildSingletonTree(4, 10, true));

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
  .add('no interceptor: sync singleton', () => {
    cnt.get(singletonD);
  })
  .add('no interceptor: sync transient', () => {
    cnt.get(transientD);
  })
  .add('eager: sync singleton', () => {
    eagerCnt.get(singletonD);
  })
  .add('eager: sync transient', () => {
    eagerCnt.get(transientD);
  })
  .add('eager with eager leafs: sync singleton', () => {
    eagerCnt.get(singletonWithEagerLeafD);
  });

await bench.warmup();
await bench.run();
console.table(bench.table());
