import { Bench } from 'tinybench';

import { container } from '../container/Container.js';
import type { GraphNode } from '../container/interceptors/graph/DependenciesGraph.js';
import { DependenciesGraphRoot } from '../container/interceptors/graph/DependenciesGraph.js';
import type { IContainer } from '../container/IContainer.js';
import type { Definition } from '../definitions/impl/Definition.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import { scoped, singleton, transient } from '../definitions/def-symbol.js';

import { buildScopedFn, buildSingletonTreeFn, buildTransientFn } from './utils.js';

function getInstancesCount(definition: Definition<any, LifeTime.singleton | LifeTime.scoped>): number {
  const debugCnt = container.new(c => {
    c.withInterceptor('graph', new DependenciesGraphRoot());
  });

  debugCnt.use(definition);

  const interceptor = debugCnt.getInterceptor('graph') as DependenciesGraphRoot;
  const root = interceptor.getGraphNode(definition) as GraphNode<number[]>;

  return root.descendants.length;
}

const singletonDefinitions = buildSingletonTreeFn(3, 10);
const transientDefinitions = buildTransientFn(3, 10);
const scopedDefinitions = buildScopedFn(3, 10);

// const singletonD = fn.singleton(use => {
//   return use.all(...singletonDefinitions);
// });

const singletonD = singleton<any>();

const transientD = transient<any>();

const scopedD = scoped<any>();

// const transientD = fn(use => {
//   return use.all(...transientDefinitions);
// });

// const scopedD = fn.scoped(use => {
//   const scope = use.scope();
//
//   return scope.all(...scopedDefinitions);
// });

console.log(`singletonD dependencies: ${getInstancesCount(singletonD)} `);
console.log(`scopedD dependencies: ${getInstancesCount(scopedD)} `);

//
let cnt: IContainer;
let cntWithInterceptor: IContainer;

let c3: IContainer;

const instantiationBench = new Bench({
  time: 200,
  setup: () => {
    cnt = container.new();

    c3 = cnt.scope();

    cntWithInterceptor = container.new(c => {
      c.withInterceptor('graph', new DependenciesGraphRoot());
    });
  },
  teardown: () => {},
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

void instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
