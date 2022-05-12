import now from 'performance-now';
import { Container, container } from '../container/Container';

import { singleton, transient } from '../definitions/definitions';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import 'source-map-support/register';

function buildSingletonsTree(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, []>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(singleton.fn((...args: any[]) => args, ...buildSingletonsTree(times, depth, (currentDepth += 1))));
  }

  return definitions;
}

function buildTransient(times: number, depth: number, currentDepth = 0): InstanceDefinition<number, any, never>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(transient.fn((...args: any[]) => args, ...buildTransient(times, depth, (currentDepth += 1))));
  }

  return definitions;
}

function resolveByObject(container: Container, def: InstanceDefinition<any, any, never>, times: number) {
  const result = {
    avg: -1,
    max: -1,
    min: 9999999999999999,
  };

  const items: number[] = [];
  let i = 0;

  for (i = 0; i < times; i++) {
    const start = now();
    const obj = container.get(def);

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

const singletonD: any = singleton.fn((...args) => args, ...buildSingletonsTree(4, 10));
const transientD: any = transient.fn((...args) => args, ...buildTransient(3, 5));

const cWithoutProxy = container();
const result10KWithoutProxy = resolveByObject(cWithoutProxy, transientD, 10000);
console.log(result10KWithoutProxy);
