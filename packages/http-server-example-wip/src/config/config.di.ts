import { singleton, value } from 'hardwired';
import { envConfig } from './EnvConfig.js';
import { loadEnvConfig } from './loadEnvConfig.js';
import { parseConfigValue } from './parseConfigValue.js';

export const envConfigDataD = singleton.fn(loadEnvConfig);
export const envValueParserD = value(parseConfigValue);
export const envConfigD = singleton.fn(envConfig, envConfigDataD, envValueParserD);
