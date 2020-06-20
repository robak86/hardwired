import { abort, handler, Handler as h, lens, pass, response, Trait, trait } from '@roro/core';
import { configurationTrait } from './configurationTrait';
import { databaseP } from './databaseTrait';

type StorageConnection = {
  storage: string;
};

const storageL = lens<StorageConnection>().fromProp('storage');

export const storageP = trait<StorageConnection>().define('storage', [configurationTrait], ctx => {
  console.log('WTF');

  return { storage: 'asdf' };
});

const someRouteValidationHandler = handler([configurationTrait], ctx => {
  if (Math.random() <= 0.5) {
    return pass(ctx);
  } else {
    return response({ statusCode: 420, type: 'data', data: { a: 1 } });
  }
});

const someRouteValidationHandler2 = handler(ctx => {
  if (Math.random() <= 0.5) {
    return pass(ctx);
  } else if (Math.random() > 0.1) {
    return response({ statusCode: 420, type: 'data', data: { a: 1 } });
  } else {
    return abort();
  }
});

const someRouteHandler = handler([configurationTrait], ctx => {
  if (Math.random() <= 0.5) {
    return pass({ ...ctx, extra: 1 });
  } else {
    return abort();
  }
});

const otherRouteHandler = handler([configurationTrait], ctx => {
  if (Math.random() <= 0.5) {
    return pass({ extra: 1 });
  } else {
    return abort();
  }
});

const justAbortHandler = handler(ctx => abort());

const pppp = h.pipe(justAbortHandler, otherRouteHandler);
// const pppp2 = h.pipe([someRouteHandler, otherRouteHandler]);

//
const depsHandler = handler([configurationTrait], ctx => {
  return pass(storageP.get(ctx));
});

const pipedHan = h.pipe(depsHandler, h.switch(someRouteHandler, someRouteValidationHandler));

const wwww = pass({ configuration: { someProp: '' } });
// pipedHan.run();

// pipe().flatMap(() => storageP);

// const combinedP = Trait.new([storageL, databaseL], ctx => {
//   const { storage } = storageL.get(ctx);
//   const { db } = databaseL.get(ctx);
//   //
//   return ctx;
// });

const piped2 = Trait.compose(configurationTrait, storageP);

const piped = Trait.compose(configurationTrait, databaseP, piped2);

// type Piped = ModuleType<typeof piped>;

// const provideDependencies = dependenciesHandler(piped);

// const locator = piped.toLocator({});

// const { storage } = locator.read(storageL);

const composed = Trait.compose(storageP, databaseP);

// const output = composed.get({}); // TODO !!!!!!!!!!!!!!!!!!!!!!!!!1 TYPES TYPES Does not work!

// TODO: Next steps
// 2: Consider if using DontAppendIfPresent is save (it sounds like a lot of troubles, and like it's over engineered
// 1. Extend Lens with bindValue() (but it should somehow signalize that it extend a object) method returning some mappable object() .map<TFrom, TTo>()
// 2. ... or maybe just create separate Lens class where set() will ignore input object, and always return object extended by the value ?
// 1. generalize reader (remove constraint on TOutput?)
// 2. Distinguish trait (as dependency injection solution) from handler()
// 2. handler will still have very similar signature to trait (taking lenses as dependencies) but will remove any object instead of BoundLens
