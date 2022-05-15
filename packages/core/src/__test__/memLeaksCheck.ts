import { container } from '../container/Container.js';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';
import { scoped, singleton, transient } from '../definitions/definitions.js';
import { external } from '../definitions/sync/external.js';
import { factory, IFactory } from '../definitions/sync/factory.js';

export const inspect = (obj: any) => {
  return console.log(u.inspect(obj, false, null, true));
};

class ConfigProvider {
  constructor(private config: ConfigData) {}
}

type ConfigData = { data: string };

class ConfigConsumer {
  public data = Array.from(Array(10000).keys());
  constructor(public configFactory: IFactory<ConfigProvider, { config: ConfigData }>) {}
}

const config = external('config').type<ConfigData>();
const d1 = transient.class(ConfigProvider, config);
const d2 = scoped.class(ConfigConsumer, factory(d1));

const c = container();

const hd = new memwatch.HeapDiff();

for (let i = 0; i < 100000000; i++) {
  c.get(d2).configFactory.build({ config: { data: 'someData' } });

  if (i % 100 === 0) {
    console.log(i);
  }
}

const diff = hd.end();

inspect(diff);
