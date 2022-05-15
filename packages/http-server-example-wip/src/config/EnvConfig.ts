import { ValueParserBuilder } from './parseConfigValue.js';
import { DotenvParseOutput } from 'dotenv';

export enum EnvConfigKey {
  NODE_ENV = 'NODE_ENV',
  SERVER_PORT = 'SERVER_PORT',
  SERVER_SECRET = 'SERVER_SECRET',
  SERVER_LOG_LEVEL = 'SERVER_LOG_LEVEL',
}

export type EnvConfig = {
  [EnvConfigKey.NODE_ENV]: string;
  [EnvConfigKey.SERVER_PORT]: number;
  [EnvConfigKey.SERVER_SECRET]: string;
  [EnvConfigKey.SERVER_LOG_LEVEL]: string;
};

export const envConfig = (configData: DotenvParseOutput, parser: ValueParserBuilder): EnvConfig => {
  const reader = parser(configData);

  return {
    get [EnvConfigKey.NODE_ENV]() {
      return reader(EnvConfigKey.NODE_ENV);
    },
    get [EnvConfigKey.SERVER_PORT]() {
      return reader(EnvConfigKey.SERVER_PORT, 'int');
    },
    get [EnvConfigKey.SERVER_SECRET]() {
      return reader(EnvConfigKey.SERVER_SECRET);
    },
    get [EnvConfigKey.SERVER_LOG_LEVEL]() {
      return reader(EnvConfigKey.SERVER_LOG_LEVEL);
    },
  };
};
