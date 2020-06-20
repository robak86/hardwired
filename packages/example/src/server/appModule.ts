import { databaseP } from './databaseTrait';
import { configurationTrait } from './configurationTrait';
import { Trait } from '@roro/core/lib/trait/trait';

const appmodule = Trait.compose(configurationTrait, databaseP);
