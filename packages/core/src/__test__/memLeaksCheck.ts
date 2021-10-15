import { container } from '../container/Container';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';
import { scoped, singleton } from '../definitions/definitions';
import { external } from '../definitions/sync/external';
import { factory, IFactory } from '../definitions/sync/factory';

export const inspect = obj => {
  return console.log(u.inspect(obj, false, null, true));
};

class ConfigProvider {
  constructor(private config: ConfigData) {}
}

type ConfigData = { data: string };

class ConfigConsumer {
  public data = Array.from(Array(10000).keys());
  constructor(public configFactory: IFactory<ConfigProvider, [ConfigData]>) {}
}

const config = external<ConfigData>();
const d1 = singleton.class(ConfigProvider, config);
const d2 = scoped.class(ConfigConsumer, factory(d1));

const c = container();

const hd = new memwatch.HeapDiff();

for (let i = 0; i < 100000; i++) {
  c.get(d2).configFactory.build({ data: 'someData' });

  if (i % 100 === 0) {
    console.log(i);
  }
}

const diff = hd.end();

inspect(diff);
