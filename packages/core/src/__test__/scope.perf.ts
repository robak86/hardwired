import { Bench } from 'tinybench';

import { fn } from '../definitions/fn.js';
import type { IContainer } from '../container/IContainer.js';
import { container } from '../container/Container.js';

import { buildScopedFn, buildSingletonTreeFn, buildTransientFn } from './utils.js';

const singletonDefinitions = buildSingletonTreeFn(3, 10);
const transientDefinitions = buildTransientFn(3, 10);
const scopedDefinitions = buildScopedFn(3, 10);

const singletonD = fn.singleton(use => {
  return use.all(...singletonDefinitions);
});

const transientD = fn(use => {
  return use.all(...transientDefinitions);
});

const scopedD = fn.scoped(use => {
  return use.scope().all(...scopedDefinitions);
});

let cnt: IContainer;
let childScope: IContainer;

const scopesBench = new Bench({
  time: 100,
  setup: () => {
    cnt = container.new();
    cnt.use(singletonD);
    cnt.use(scopedD);
    cnt.use(transientD);

    childScope = cnt.scope();
    childScope.use(singletonD);
    childScope.use(scopedD);
    childScope.use(transientD);
  },
  teardown: () => {
    cnt = container.new();
    // childScope = container.new();
  },
});

scopesBench.add('scope without configuration', () => {
  cnt.scope();
});

void scopesBench
  .warmup()
  .then(_ => scopesBench.run())
  .then(_ => console.table(scopesBench.table()));
