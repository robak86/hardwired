import { defineRouter } from '../helpers/routing/defineRouter';
import { helloWorldHandlerD, postJsonHandlerD } from './handlers.di';

export const appRouterD = defineRouter(
  ['GET', '/', helloWorldHandlerD],
  ['GET', '/hello', helloWorldHandlerD],
  ['GET', '/post-it', postJsonHandlerD],
);
