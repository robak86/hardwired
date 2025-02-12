import {container} from '../container/Container.js';

import {fn} from '../definitions/definitions.js';
import {Bench} from 'tinybench';

import {buildScoped, buildSingletonTree, buildTransient} from './utils.js';
import {IContainer} from '../container/IContainer.js';
import {DependenciesGraphRoot} from '../container/interceptors/dependencies-graph.js';

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
let cntWithInterceptor: IContainer;

// @ts-ignore
let c1: IContainer;
// @ts-ignore
let c2: IContainer;
let c3: IContainer;

const instantiationBench = new Bench({
  time: 200,
  setup: () => {
    cnt = container.new();
    c1 = cnt.scope(scope => {
      scope.cascade(scopedD);
    });
    c2 = cnt.scope(scope => {});
    c3 = cnt.scope(scope => {});

    cntWithInterceptor = container.new(c => c.withInterceptor('graph', new DependenciesGraphRoot()));
  },
  teardown: () => {
    cnt = container.new();
    c1 = cnt.scope(scope => {
      scope.cascade(scopedD);
    });
    c2 = cnt.scope(scope => {});
    c3 = cnt.scope(scope => {});
  },
});

instantiationBench
  .add('singletonD', () => {
    cnt.use(singletonD);
  })
  .add('singletonD + new scope', () => {
    cnt.withScope(use => use(singletonD));
  })
  .add('singletonD + new disposable', () => {
    using scoped = cnt.disposable();
    scoped.use(singletonD);
  })
  .add('transientD', () => {
    cnt.use(transientD);
  })
  .add('transientD + new scope', () => {
    cnt.withScope(use => use(transientD));
  })
  .add('transientD + new disposable', () => {
    using scoped = cnt.disposable();
    scoped.use(transientD);
  })
  .add('scopedD', () => {
    cnt.use(scopedD);
  })
  .add('scopedD + new scope', () => {
    cnt.withScope(use => use(scopedD));
  })
  .add('scopedD + new disposable', () => {
    using scoped = cnt.disposable();
    scoped.use(scopedD);
  })
  .add('scopedD cascaded to lower scope', () => {
    c3.use(scopedD);
  })
  // with interceptor
  .add('[DependencyGraphInterceptor] singletonD', () => {
    cntWithInterceptor.use(singletonD);
  })
  .add('[DependencyGraphInterceptor] singletonD + new scope', () => {
    cntWithInterceptor.withScope(use => use(singletonD));
  })
  .add('[DependencyGraphInterceptor] singletonD + new disposable', () => {
    using scoped = cntWithInterceptor.disposable();
    scoped.use(singletonD);
  })
  .add('[DependencyGraphInterceptor] transientD', () => {
    cntWithInterceptor.use(transientD);
  })
  .add('[DependencyGraphInterceptor] transientD + new scope', () => {
    cntWithInterceptor.withScope(use => use(transientD));
  })
  .add('[DependencyGraphInterceptor] transientD + new disposable', () => {
    using scoped = cntWithInterceptor.disposable();
    scoped.use(transientD);
  })
  .add('[DependencyGraphInterceptor] scopedD', () => {
    cntWithInterceptor.use(scopedD);
  })
  .add('[DependencyGraphInterceptor] scopedD + new scope', () => {
    cntWithInterceptor.withScope(use => use(scopedD));
  })
  .add('[DependencyGraphInterceptor] scopedD + new disposable', () => {
    using scoped = cntWithInterceptor.disposable();
    scoped.use(scopedD);
  });

instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
