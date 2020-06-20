import { abort, Handler as h, handler, pass, response, RouteHandler, trait } from '@roro/core';
import { createUserRoute, usersListRoute } from '../contract/usersContract';
import { databaseP } from './databaseTrait';
import { configurationTrait } from './configurationTrait';

export const usersListHandler = RouteHandler.query(
  usersListRoute,

  h.pipe(
    handler(ctx => pass(ctx)),
    handler(ctx => response({ users: [] })),
  ),
);

// Trait.new(name: string, dependencies).returns(ctx => {})

type CreateUserValidator = {
  validateUser: any;
};

const createUserValidator = trait<CreateUserValidator>().define('validators', ctx => {
  return {
    validateUser: () => null,
  };
});

const validateHandler = handler(ctx => {
  return Math.random() ? pass(ctx) : response({ extra: '' });
});

const passHandler = handler([configurationTrait, databaseP], ctx => {
  // const { db } = Trait.read(databaseP, ctx);
  const { database } = databaseP.get(ctx);

  return pass(databaseP.get(ctx));
});

const createHandler = handler(ctx => {
  return response({ status: 'success' as 'success' });
});

const extraConditionHandler = handler([databaseP], ctx => {
  const { db } = databaseP.read(ctx);

  return Math.random() ? pass(ctx) : abort();
});

export const createUserHandler = RouteHandler.command({
  definition: createUserRoute,
  handler: h.pipe(passHandler, h.switch(extraConditionHandler, validateHandler, createHandler)),
});

export const usersModuleHandler = h.switch(usersListHandler, createUserHandler);
