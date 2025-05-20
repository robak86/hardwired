import type { Definition } from '../definitions/impl/Definition.js';
import type { AnyDefinitionSymbol } from '../definitions/abstract/IDefinition.js';

export function buildSingletonTreeFn(times: number, depth: number, currentDepth = 0): Definition<number, any>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: AnyDefinitionSymbol[] = [];

  for (let i = 0; i < times; i++) {
    x;
    definitions.push(
      fn.singleton(use => {
        return use.all(...buildSingletonTreeFn(times, depth, (currentDepth += 1)));
      }),
    );
  }

  return definitions;
}

export function buildTransientFn(times: number, depth: number, currentDepth = 0): Definition<number, any>[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return definitions;
}

export function buildScopedFn(times: number, depth: number, currentDepth = 0): Definition<number, any>[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return definitions;
}
