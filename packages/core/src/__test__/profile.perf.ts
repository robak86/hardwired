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
  registerTestDefinitionsAsync,
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

const configureAsAsync = configureContainer(c => {
  registerTestDefinitionsAsync(singletonDefs, c);
  registerTestDefinitionsAsync(transientDefs, c);
  registerTestDefinitionsAsync(scopedDefs, c);
  registerTestDefinitionsAsync(cascadingDefs, c);
});

let syncCnt: IContainer;
let asyncCnt: IContainer;
let cntWithInterceptor: IContainer;

let syncCntScope: IContainer;
let asyncCntScope: IContainer;

const instantiationBench = new Bench({
  time: 200,
  iterations: 1000,
  setup: () => {
    syncCnt = container.new(configure);
    asyncCnt = container.new(configureAsAsync);

    syncCntScope = syncCnt.scope();
    asyncCntScope = asyncCnt.scope();

    cntWithInterceptor = container.new(configure, c => {
      c.withInterceptor(DependenciesGraphInterceptor);
    });
  },
  teardown: () => {},
});

instantiationBench
  .add('[sync definitions] singletonD', () => {
    syncCnt.use(singletonD).trySync();
  })
  .add('[sync definitions] singletonD + new scope', () => {
    syncCnt.scope().use(singletonD).trySync();
  })
  .add('[sync definitions] transientD', () => {
    syncCnt.use(transientD).trySync();
  })
  .add('[sync definitions] transientD + new scope', () => {
    syncCnt.scope().use(transientD).trySync();
  })
  .add('[sync definitions] scopedD', () => {
    syncCnt.use(scopedD).trySync();
  })
  .add('[sync definitions] scopedD + new scope', () => {
    syncCnt.scope().use(scopedD).trySync();
  })
  .add('[sync definitions] scopedD cascaded to lower scope', () => {
    syncCntScope.use(scopedD).trySync();
  })
  .add('[sync definitions] cascadingD', () => {
    syncCnt.use(cascadingD).trySync();
  })
  .add('[sync definitions] cascadingD + new scope', () => {
    syncCnt.scope().use(cascadingD).trySync();
  })
  .add('[sync definitions] cascadingD cascaded to lower scope', () => {
    syncCntScope.use(cascadingD).trySync();
  })

  .add('[async definitions] singletonD', async () => {
    await asyncCnt.use(singletonD);
  })
  .add('[async definitions] singletonD + new scope', async () => {
    await asyncCnt.scope().use(singletonD);
  })
  .add('[async definitions] transientD', async () => {
    await asyncCnt.use(transientD);
  })
  .add('[async definitions] transientD + new scope', async () => {
    await asyncCnt.scope().use(transientD);
  })
  .add('[async definitions] scopedD', async () => {
    await asyncCnt.use(scopedD);
  })
  .add('[async definitions] scopedD + new scope', async () => {
    await asyncCnt.scope().use(scopedD);
  })
  .add('[async definitions] scopedD cascaded to lower scope', async () => {
    await asyncCntScope.use(scopedD);
  })
  .add('[async definitions] cascadingD', async () => {
    await asyncCnt.use(cascadingD);
  })
  .add('[async definitions] cascadingD + new scope', async () => {
    await asyncCnt.scope().use(cascadingD);
  })
  .add('[async definitions] cascadingD cascaded to lower scope', async () => {
    await asyncCntScope.use(cascadingD);
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
