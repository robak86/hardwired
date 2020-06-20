import { compile, PathFunction } from 'path-to-regexp';

export type CompilePathDefinitionFn = {
  (definition: string): PathFunction<any>;
  clearCache: () => void;
};

const compileCached = (): CompilePathDefinitionFn => {
  let cache: Record<string, PathFunction<any>> = {};

  const compileFunction = (definition): PathFunction<any> =>
    cache[definition] || (cache[definition] = compile(definition));

  compileFunction.clearCache = () => (cache = {});

  return compileFunction;
};

export const compilePathDefinition = compileCached();
