import { container } from '../container/Container.js';

import { fn } from '../definitions/definitions.js';

// import 'source-map-support/register';
import Bench from 'tinybench';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';
import { IContainer } from '../container/IContainer.js';

function buildSingletonTree(times: number, depth: number, currentDepth = 0): BaseDefinition<number, any, any>[] {
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

function buildTransient(times: number, depth: number, currentDepth = 0): BaseDefinition<number, any, any>[] {
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

function buildScoped(times: number, depth: number, currentDepth = 0): BaseDefinition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.scoped(use => {
        return use.all(...buildScoped(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

const singletonDefinitions = buildSingletonTree(3, 10);
const transientDefinitions = buildTransient(3, 10);
const scopedDefinitions = buildScoped(3, 10);

const singletonD = fn.singleton(use => {
  return use.all(...singletonDefinitions);
});

const transientD = fn(use => {
  return use.all(...transientDefinitions);
});

const scopedD = fn.scoped(use => {
  return use.withScope(use => {
    return use.all(...scopedDefinitions);
  });
});

let cnt: IContainer;

const bench = new Bench({
  time: 100,
  setup: () => {
    cnt = container.new();
  },
  teardown: () => {
    cnt = container.new();
  },
});

bench
  .add('singletonD', () => {
    cnt.use(singletonD);
  })
  .add('transientD', () => {
    cnt.use(transientD);
  })
  .add('scopedD', () => {
    cnt.use(scopedD);
  });

bench
  .warmup()
  .then(_ => bench.run())
  .then(_ => console.table(bench.table()));
