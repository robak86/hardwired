import memwatch from '@airbnb/node-memwatch';
import { inspect } from 'node:util';

// export const inspect = (obj: any) => {
//   return console.log(u.inspect(obj, false, null, true));
// };
//
// class ConfigProvider {
//   constructor(private _config: ConfigData) {}
// }
//
// type ConfigData = { data: string };
//
// const config = unbound<ConfigData>('config');
//
// const d1 = fn(use => {
//   return new ConfigProvider(use(config));
// });
//
// const c = container();

const hd = new memwatch.HeapDiff();

const diff = hd.end();

inspect(diff);
