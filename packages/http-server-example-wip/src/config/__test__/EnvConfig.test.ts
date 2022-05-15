import { container, set } from 'hardwired';
import { envConfigD, envConfigDataD } from '../config.di.js';
import { EnvConfigKey } from '../EnvConfig.js';
import { DotenvParseOutput } from 'dotenv';

describe(`EnvConfig`, () => {
  it(`correctly parses server port`, async () => {
    const configDataMock = {
      [EnvConfigKey.SERVER_PORT]: '1234',
    } as DotenvParseOutput;

    const config = container([set(envConfigDataD, configDataMock)]).get(envConfigD);
    expect(config[EnvConfigKey.SERVER_PORT]).toEqual(1234);
  });
});
