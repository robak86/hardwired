export type { QueryRouteDefinition } from './query-route/QueryRouteDefinition';
export type { CommandRouteDefinition } from './command-route/CommandRouteDefinition';

export { createCommandRoute } from './command-route/createCommandRoute';
export { createQueryRoute } from './query-route/createQueryRoute';
export { HttpMethod } from './HttpMethod';

//TODO: it would be tempting to you package.json versioning for api versioning, but the chosen approach need to support
// monorepo files organization (no versioning!)
