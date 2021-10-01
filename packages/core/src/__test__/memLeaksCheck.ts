import { unit } from '../module/ModuleBuilder';
import { singleton } from '../strategies/SingletonStrategyLegacy';
import { scoped } from '../strategies/ScopeStrategy';
import { container } from '../container/Container';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';

export const inspect = obj => {
  return console.log(u.inspect(obj, false, null, true));
};

class ConfigProvider {}

class ConfigConsumer {
  public data = Array.from(Array(10000).keys());
  constructor(private config: ConfigProvider) {}
}

const m = unit()
  .define('d1', singleton, ctx => new ConfigProvider())
  .define('d2', scoped, ctx => new ConfigConsumer(ctx.d1))
  .build();

const c = container();

const hd = new memwatch.HeapDiff();

for (let i = 0; i < 1000000; i++) {
  const scope = c.checkoutScope();
  const d = scope.get(m, 'd2');

  if (i % 100 === 0) {
    console.log(i);
  }
}

const diff = hd.end();

inspect(diff);
