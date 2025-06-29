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

console.log('Transients deps count:', countDependenciesTreeCount(transientDefs[0]));
console.log('Scoped deps count:', countDependenciesTreeCount(scopedDefs[0]));
console.log('Cascading deps count:', countDependenciesTreeCount(cascadingDefs[0]));

const configure = configureScope(c => {
  registerTestDefinitions(transientDefs, c);
  registerTestDefinitions(scopedDefs, c);
  registerTestDefinitions(cascadingDefs, c);
});

const cnt = container();

while (true) {
  console.log('Creating scope...');
  cnt.scope(configure);
}
