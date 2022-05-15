import winston from 'winston';
import { EnvConfig, EnvConfigKey } from '../config/EnvConfig.js';
import { singleton } from 'hardwired';
import { envConfigD } from '../config/config.di.js';

export const createLogger = (env: EnvConfig) => {
  const format = winston.format.combine(
    winston.format.simple(),
    winston.format.timestamp(),
    winston.format.colorize({ all: true }),
  );

  return winston.createLogger({
    level: env[EnvConfigKey.SERVER_LOG_LEVEL],
    format,
    transports: [new winston.transports.Console({})],
    exceptionHandlers: [new winston.transports.Console()],
  });
};

export const loggerD = singleton.fn(createLogger, envConfigD);
