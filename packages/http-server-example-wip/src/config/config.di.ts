import { singleton, value } from 'hardwired';
import { envConfig } from './EnvConfig';
import { loadEnvConfig } from './loadEnvConfig';
import { parseConfigValue } from './parseConfigValue';

export const envConfigDataD = singleton.fn(loadEnvConfig);
export const envValueParserD = value(parseConfigValue);
export const envConfigD = singleton.fn(envConfig, envConfigDataD, envValueParserD);
