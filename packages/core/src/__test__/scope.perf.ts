import { Bench } from 'tinybench';

import type { IContainer } from '../container/IContainer.js';
import { container } from '../container/Container.js';
import { configureScope } from '../configuration/ScopeConfiguration.js';

import {
  buildCascadingDefs,
  buildScopedDefs,
  buildTransientDefs,
  countDependenciesTreeCount,
  registerTestDefinitions,
} from './utils.js';

const transientDefs = buildTransientDefs(3, 10);
const scopedDefs = buildScopedDefs(3, 10);
const cascadingDefs = buildCascadingDefs(3, 10);

const transientD = transientDefs[0].def;
const scopedD = scopedDefs[0].def;
const cascadingD = cascadingDefs[0].def;

console.log('Transients deps count:', countDependenciesTreeCount(transientDefs[0]));
console.log('Scoped deps count:', countDependenciesTreeCount(scopedDefs[0]));
console.log('Cascading deps count:', countDependenciesTreeCount(cascadingDefs[0]));

const configure = configureScope(c => {
  registerTestDefinitions(transientDefs, c);
  registerTestDefinitions(scopedDefs, c);
  registerTestDefinitions(cascadingDefs, c);
});

let cnt: IContainer;
let childScope: IContainer;

const scopesBench = new Bench({
  time: 100,
  setup: () => {
    cnt = container.new();

    childScope = cnt.scope(configure);

    // void childScope.use(singletonD);
    void childScope.use(scopedD);
    void childScope.use(transientD);
    void childScope.use(cascadingD);
  },
  teardown: () => {
    cnt = container.new();
  },
});

scopesBench
  .add('scope without configuration', () => {
    cnt.scope();
  })
  .add('scope with configuration', () => {
    cnt.scope(configure); // TODO: slow as hell. Configuration needs to be eagerly evaluated and ready to use when scope is created
  });

void scopesBench
  .warmup()
  .then(_ => scopesBench.run())
  .then(_ => console.table(scopesBench.table()));
