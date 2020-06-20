import { commandRouteHandler } from './commandRouteHandler';
import { queryRouteHandler } from './queryRoute';

export const RouteHandler = {
  command: commandRouteHandler,
  query: queryRouteHandler,
};
