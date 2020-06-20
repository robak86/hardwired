import { lens, trait } from '@roro/core';
import { configurationTrait } from './configurationTrait';

type DatabaseConnection = {
  db: number;
};

const databaseL = lens<DatabaseConnection>().fromProp('database');

export const databaseP = trait<DatabaseConnection>().define('database', [configurationTrait], ctx => {
  const { someProp } = configurationTrait.read(ctx);

  return { db: 123 };
});

/*
export const databaseP = trait<DatabaseConnection>('database', [configurationP], ctx => {
  const { someProp } = configurationL.get(ctx);
  return { db: 123 };
});
 */

// export type DatabaseTrait = TraitContext<typeof databaseP>;
