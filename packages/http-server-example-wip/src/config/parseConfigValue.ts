import { EnvConfigKey } from './EnvConfig.js';
import { DotenvParseOutput } from 'dotenv';

export type GetConfigFn = {
  (key: EnvConfigKey): string;
  (key: EnvConfigKey, parser: 'int'): number;
  (key: EnvConfigKey, parser: 'boolean'): boolean;
};

export type ValueParserBuilder = (config: DotenvParseOutput) => GetConfigFn;

export const parseConfigValue: ValueParserBuilder = config => {
  return (key, parser?): any => {
    if (!config) {
      new Error(`Cannot load data with env configuration`);
    }

    if (!config[key]) {
      throw new Error(`Env variable: ${key} is missing`);
    }
    const value = config[key];

    if (parser === 'int') {
      const parsedValue = parseInt(value, 10);
      if (!Number.isFinite(parsedValue)) {
        throw new Error(`Variable: ${key} cannot be parsed to int`);
      }
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
