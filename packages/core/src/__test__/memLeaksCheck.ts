import { container } from '../container/Container.js';
import u from 'util';

import memwatch from '@airbnb/node-memwatch';
import { fn } from '../definitions/definitions.js';

import { implicit } from '../definitions/sync/implicit.js';

export const inspect = (obj: any) => {
  return console.log(u.inspect(obj, false, null, true));
};

class ConfigProvider {
  constructor(private config: ConfigData) {}
}

type ConfigData = { data: string };

const config = implicit<ConfigData>('config');

const d1 = fn(use => {
  return new ConfigProvider(use(config));
});

const c = container();

const hd = new memwatch.HeapDiff();

const diff = hd.end();

inspect(diff);
