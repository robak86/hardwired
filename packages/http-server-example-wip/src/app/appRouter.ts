import { defineRouter } from '../helpers/routing/defineRouter';
import { helloWorldHandlerD } from './handlers.di';

export const appRouterD = defineRouter(
  ['GET', '/', helloWorldHandlerD],
  ['GET', '/a', helloWorldHandlerD],
  ['GET', '/b', helloWorldHandlerD],
);
