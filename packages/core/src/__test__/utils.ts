import type { Definition } from '../definitions/abstract/Definition.js';
import { fn } from '../definitions/definitions.js';
import type { AnyDefinition } from '../definitions/abstract/IDefinition.js';

export function buildSingletonTreeFn(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: AnyDefinition[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.singleton(use => {
        return use.all(...buildSingletonTreeFn(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

export function buildTransientFn(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn(use => {
        return use.all(...buildTransientFn(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

export function buildScopedFn(times: number, depth: number, currentDepth = 0): Definition<number, any, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: any[] = [];

  for (let i = 0; i < times; i++) {
    definitions.push(
      fn.scoped(use => {
        return use.all(...buildScopedFn(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}
