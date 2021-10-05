import { container } from '../container/Container';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';
import { scoped, singleton } from '../definitions/factory/definitions';

export const inspect = obj => {
  return console.log(u.inspect(obj, false, null, true));
};

class ConfigProvider {}

class ConfigConsumer {
  public data = Array.from(Array(10000).keys());
  constructor(private config: ConfigProvider) {}
}

const d1 = singleton.class(ConfigProvider);
const d2 = scoped.class(ConfigConsumer, d1);

const c = container();

const hd = new memwatch.HeapDiff();

for (let i = 0; i < 1000000; i++) {
  const scope = c.checkoutScope();
  const d = scope.get(d2);

  if (i % 100 === 0) {
    console.log(i);
  }
}

const diff = hd.end();

inspect(diff);
