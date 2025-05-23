import { Bench } from 'tinybench';

import { container } from '../container/Container.js';
import { DependenciesGraphInterceptor } from '../container/interceptors/graph/DependenciesGraph.js';
import type { IContainer } from '../container/IContainer.js';
import { configureContainer } from '../configuration/ContainerConfiguration.js';

import {
  buildCascadingDefs,
  buildScopedDefs,
  buildSingletonDefs,
  buildTransientDefs,
  countDependenciesTreeCount,
  registerTestDefinitions,
} from './utils.js';

const singletonDefs = buildSingletonDefs(3, 10);
const transientDefs = buildTransientDefs(3, 10);
const scopedDefs = buildScopedDefs(3, 10);
const cascadingDefs = buildCascadingDefs(3, 10);

const singletonD = singletonDefs[0].def;
const transientD = transientDefs[0].def;
const scopedD = scopedDefs[0].def;
const cascadingD = cascadingDefs[0].def;

console.log('Singletons deps count:', countDependenciesTreeCount(singletonDefs[0]));
console.log('Transients deps count:', countDependenciesTreeCount(transientDefs[0]));
console.log('Scoped deps count:', countDependenciesTreeCount(scopedDefs[0]));
console.log('Cascading deps count:', countDependenciesTreeCount(cascadingDefs[0]));

const configure = configureContainer(c => {
  registerTestDefinitions(singletonDefs, c);
  registerTestDefinitions(transientDefs, c);
  registerTestDefinitions(scopedDefs, c);
  registerTestDefinitions(cascadingDefs, c);
});

let cnt: IContainer;
let cntWithInterceptor: IContainer;

let c3: IContainer;

const instantiationBench = new Bench({
  time: 200,
  setup: () => {
    cnt = container.new(configure);

    c3 = cnt.scope();

    cntWithInterceptor = container.new(configure, c => {
      c.withNewInterceptor(DependenciesGraphInterceptor);
    });
  },
  teardown: () => {},
});

instantiationBench
  .add('singletonD', () => {
    void cnt.use(singletonD);
  })
  .add('singletonD + new scope', () => {
    void cnt.scope().use(singletonD);
  })
  .add('transientD', () => {
    void cnt.use(transientD);
  })
  .add('transientD + new scope', () => {
    void cnt.scope().use(transientD);
  })
  .add('scopedD', () => {
    void cnt.use(scopedD);
  })
  .add('scopedD + new scope', () => {
    void cnt.scope().use(scopedD);
  })
  .add('scopedD cascaded to lower scope', () => {
    void c3.use(scopedD);
  })
  .add('cascadingD', () => {
    void cnt.use(cascadingD);
  })
  .add('cascadingD + new scope', () => {
    void cnt.scope().use(cascadingD);
  })
  .add('cascadingD cascaded to lower scope', () => {
    void c3.use(cascadingD);
  })
  // with interceptor
  .add('[DependencyGraphInterceptor] singletonD', () => {
    void cntWithInterceptor.use(singletonD);
  })
  .add('[DependencyGraphInterceptor] singletonD + new scope', () => {
    void cntWithInterceptor.scope().use(singletonD);
  })
  .add('[DependencyGraphInterceptor] transientD', () => {
    void cntWithInterceptor.use(transientD);
  })
  .add('[DependencyGraphInterceptor] transientD + new scope', () => {
    void cntWithInterceptor.scope().use(transientD);
  })
  .add('[DependencyGraphInterceptor] scopedD', () => {
    void cntWithInterceptor.use(scopedD);
  })
  .add('[DependencyGraphInterceptor] scopedD + new scope', () => {
    void cntWithInterceptor.scope().use(scopedD);
  });

void instantiationBench
  .warmup()
  .then(_ => instantiationBench.run())
  .then(_ => console.table(instantiationBench.table()));
