import { Container, container } from '../container/Container.js';

import { fn } from '../definitions/definitions.js';

import 'source-map-support/register';
import Bench from 'tinybench';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

function buildSingletonTree(times: number, depth: number, currentDepth = 0): BaseDefinition<number, any, never, any>[] {
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

function buildTransient(times: number, depth: number, currentDepth = 0): BaseDefinition<number, any, never, any>[] {
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
