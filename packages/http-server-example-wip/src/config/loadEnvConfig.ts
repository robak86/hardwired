import { config, DotenvParseOutput } from 'dotenv';

export const loadEnvConfig = (): DotenvParseOutput => {
  const loadedConfig = config();
  if (loadedConfig.error) {
    throw loadedConfig.error;
  }

  return loadedConfig.parsed ?? {};
};
