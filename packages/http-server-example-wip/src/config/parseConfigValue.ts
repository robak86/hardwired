import invariant from 'tiny-invariant';
import { EnvConfigKey } from './EnvConfig';
import { DotenvParseOutput } from 'dotenv';

export type GetConfigFn = {
  (key: EnvConfigKey): string;
  (key: EnvConfigKey, parser: 'int'): number;
  (key: EnvConfigKey, parser: 'boolean'): boolean;
};


export type ValueParserBuilder = (config:DotenvParseOutput) => GetConfigFn

export const parseConfigValue:ValueParserBuilder = config => {
  return (key, parser?): any => {
    invariant(config, `Cannot load data with env configuration`);

    invariant(config[key], `Env variable: ${key} is missing`);
    const value = config[key];

    if (parser === 'int') {
      const parsedValue = parseInt(value, 10);
      invariant(Number.isFinite(parsedValue), `Variable: ${key} cannot be parsed to int`);
      return parsedValue;
    }

    if (parser === 'boolean') {
      if (value === 'true') {
        return true;
      }

      if (value === 'false') {
        return false;
      }

      throw new Error(`Variable: ${key} cannot be parsed to boolean. Boolean parser accept only true|false values.`);
    }

    return value;
  };
};
