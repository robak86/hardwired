import { Bench } from 'tinybench';

import { container } from '../container/Container.js';
import { fn } from '../definitions/fn.js';
import type { IContainer } from '../container/IContainer.js';
import { DependenciesGraphRoot } from '../container/interceptors/graph/DependenciesGraph.js';

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
  const scope = use.scope();

  return scope.all(...scopedDefinitions);
});

let cnt: IContainer;
let cntWithInterceptor: IContainer;

// @ts-ignore
let c2: IContainer;
let c3: IContainer;

const instantiationBench = new Bench({
  time: 200,
  setup: () => {
    cnt = container.new();

    c2 = cnt.scope(scope => {});
    c3 = cnt.scope(scope => {});

    cntWithInterceptor = container.new(c => {
      c.withInterceptor('graph', new DependenciesGraphRoot());
    });
  },
  teardown: () => {
    // cnt = undefined;
    //
    // c2 = null;
    // c3 = null;
  },
});

instantiationBench
  .add('singletonD', () => {
    cnt.use(singletonD);
  })
  .add('singletonD + new scope', () => {
    cnt.scope().use(singletonD);
  })
  .add('transientD', () => {
    cnt.use(transientD);
  })
  .add('transientD + new scope', () => {
    cnt.scope().use(transientD);
  })
  .add('scopedD', () => {
    cnt.use(scopedD);
  })
  .add('scopedD + new scope', () => {
    cnt.scope().use(scopedD);
  })
  .add('scopedD cascaded to lower scope', () => {
    c3.use(scopedD);
  })
  // with interceptor
  .add('[DependencyGraphInterceptor] singletonD', () => {
    cntWithInterceptor.use(singletonD);
  })
  .add('[DependencyGraphInterceptor] singletonD + new scope', () => {
    cntWithInterceptor.scope().use(singletonD);
  })
  .add('[DependencyGraphInterceptor] transientD', () => {
    cntWithInterceptor.use(transientD);
  })
  .add('[DependencyGraphInterceptor] transientD + new scope', () => {
    cntWithInterceptor.scope().use(transientD);
  })
  .add('[DependencyGraphInterceptor] scopedD', () => {
    cntWithInterceptor.use(scopedD);
  })
  .add('[DependencyGraphInterceptor] scopedD + new scope', () => {
    cntWithInterceptor.scope().use(scopedD);
  });

await instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
