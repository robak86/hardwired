import { container } from '../container/Container.js';

import { fn } from '../definitions/definitions.js';
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
// @ts-ignore
let c1: IContainer;
// @ts-ignore
let c2: IContainer;
let c3: IContainer;

const instantiationBench = new Bench({
  time: 100,
  setup: () => {
    cnt = container.new();
    c1 = cnt.checkoutScope(scope => {
      scope.cascade(scopedD);
    });
    c2 = cnt.checkoutScope(scope => {});
    c3 = cnt.checkoutScope(scope => {});
  },
  teardown: () => {
    cnt = container.new();
    c1 = cnt.checkoutScope(scope => {
      scope.cascade(scopedD);
    });
    c2 = cnt.checkoutScope(scope => {});
    c3 = cnt.checkoutScope(scope => {});
  },
});

instantiationBench
  .add('singletonD', () => {
    cnt.use(singletonD);
  })
  .add('transientD', () => {
    cnt.use(transientD);
  })
  .add('scopedD', () => {
    cnt.use(scopedD);
  })
  .add('scopedD cascaded to lower scope', () => {
    c3.use(scopedD);
  });

instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
