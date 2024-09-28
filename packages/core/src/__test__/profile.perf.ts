import { container } from '../container/Container.js';

import { fn } from '../definitions/definitions.js';

// import 'source-map-support/register';
import { Bench } from 'tinybench';

import { buildScoped, buildSingletonTree, buildTransient } from './utils.js';
import { IContainer } from '../container/IContainer.js';

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
