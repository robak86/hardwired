import now from 'performance-now';
import { Container, container } from '../container/Container';
import { unit } from '../module/ModuleBuilder';
import { Module } from '../module/Module';

function registerN(times: number) {
  const result = {
    container: container(),
    register: -1,
    module: unit() as any,
  };

  for (let i = 0; i < times; i++) {
    const start = now();
    result.module = result.module.define(`SOME_ID_${i}`, () => ({ test: 1 }));
    const end = now();
    result.register = end - start;
  }
  result.module = result.module.build();

  return result;
}

function resolveByObject(container: Container, module: Module<any>, times: number) {
  const result = {
    avg: -1,
    max: -1,
    min: 9999999999999999,
  };

  const items: number[] = [];
  let i = 0;

  for (i = 0; i < times; i++) {
    const start = now();
    const obj = container.asObject(module);
    const instance = obj[`SOME_ID_${times}`];

    const end = now();
    const total = end - start;

    if (total < result.min) {
      result.min = total;
    }
    if (total > result.max) {
      result.max = total;
    }

    items.push(total);
  }

  result.avg = items.reduce((p, c) => p + c, 0) / items.length;

  return result;
}

const { module } = registerN(10000);

console.log('no proxy');
const cWithoutProxy = container({ useProxy: false });
const result10KWithoutProxy = resolveByObject(cWithoutProxy, module, 100);
console.log(result10KWithoutProxy);

console.log('using proxy');
const cWithProxy = container({ useProxy: true });
const result10KWithProxy = resolveByObject(cWithProxy, module, 100);
console.log(result10KWithProxy);
