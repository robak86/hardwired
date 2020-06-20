import { createQueryRoute, HttpMethod } from '@roro/routing-contract';
import { createCommandRoute } from '@roro/routing-contract/lib';

export type User = {
  firstName: string;
  lastName: string;
};

export type UserListState = {
  users: User[];
};

export type UsersListParams = {
  query: string;
};

export const usersListRoute = createQueryRoute<UsersListParams, UserListState>(HttpMethod.GET, '/users').mapParams(
  [],
  ['query'],
);

export type CreateUserParams = {
  firstName: string;
  lastName: string;
};

export type CreateUserSuccess = { status: 'success' }; // TODO: but command probably should not return any data except the status and newly created id?... or the unique id should be passed in command!! ?
export type ValidationErrors = { validationError: string };
export type ExtraDifferentResponse = { extra: string };

export const createUserRoute = createCommandRoute<
  CreateUserParams,
  CreateUserSuccess | ValidationErrors | ExtraDifferentResponse
>(HttpMethod.POST, '/users').mapParams([], ['firstName', 'lastName']);
