import type { AnyDefinition, Definition } from '../definitions/abstract/Definition.js';
import { fn } from '../definitions/definitions.js';

export function buildSingletonTree(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: AnyDefinition[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.singleton(use => {
        return use.all(...buildSingletonTree(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

export function buildTransient(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn(use => {
        return use.all(...buildTransient(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

export function buildScoped(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.scoped(use => {
        return use.all(...buildScoped(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}
