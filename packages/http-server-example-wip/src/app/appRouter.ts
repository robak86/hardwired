import { defineRouter } from '../helpers/routing/defineRouter.js';
import { helloWorldHandlerD, postJsonHandlerD } from './handlers.di.js';

export const appRouterD = defineRouter(
  ['GET', '/', helloWorldHandlerD],
  ['GET', '/hello', helloWorldHandlerD],
  ['GET', '/post-it', postJsonHandlerD],
);
