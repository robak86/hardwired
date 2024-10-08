import { fn } from '../definitions/definitions.js';

import { buildScoped, buildSingletonTree, buildTransient } from './utils.js';
import { IContainer } from '../container/IContainer.js';
import { container } from '../container/Container.js';
import { Bench } from 'tinybench';

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

scopesBench
  .warmup()
  .then(_ => scopesBench.run())
  .then(_ => console.table(scopesBench.table()));
