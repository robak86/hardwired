import { lens, trait } from '@roro/core';

type AppConfig = {
  someProp: string;
};

const configurationL = lens<AppConfig>().fromProp('configuration');

export const configurationTrait = trait<AppConfig>().define('config', ctx => {
  return { someProp: '' };
});
