import { container } from '../container/Container.js';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';
import { scoped, transient } from '../definitions/definitions.js';

import { factory, IFactory } from '../definitions/sync/factory.js';
import { implicit } from '../definitions/sync/implicit.js';

export const inspect = (obj: any) => {
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

const config = implicit<ConfigData>('config');
const d1 = transient.using(config).class(ConfigProvider);
const d2 = scoped.using(factory(d1, config)).class(ConfigConsumer);

const c = container();

const hd = new memwatch.HeapDiff();

for (let i = 0; i < 100000000; i++) {
  c.get(d2).configFactory.build({ data: 'someData' });

  if (i % 100 === 0) {
    console.log(i);
  }
}

const diff = hd.end();

inspect(diff);
