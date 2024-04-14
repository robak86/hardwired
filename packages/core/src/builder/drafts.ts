import { value } from '../definitions/sync/value.js';
import { singleton } from '../definitions/definitions.js';
import { container } from '../container/Container.js';
import { object } from '../definitions/sync/object.js';

const val1 = value(123);
const val2 = value('123');

class MyClass {
  constructor(
    public a: number,
    public b: string,
  ) {}
}

class MyClassLimited {
  constructor(public a: number) {}
}

class OtherClass {
  constructor(
    public a: number,
    public c: MyClass,
  ) {}
}

const myFunc = (a: number, b: string) => 123;

const myClass = singleton.using(val1, val2).class(MyClass);
const myClassLimited = singleton.using(val1).class(MyClassLimited);

const myPartialFn = singleton.using(val1, val2).partial(myFunc);

const instance = container().get(myPartialFn);

const val = instance();

const myOtherClass = singleton.using(val1, myClass).class(OtherClass);

const myOtherClassAsync = singleton.usingAsync(val1, myClass).class(OtherClass);

const withDefine = singleton.define(locator => {
  return null;
});

const myFn = singleton //
  .using(val1, myClass, object({ myOtherClass, myClassLimited }))
  .fn((val1, cls, obj) => {
    return null;
  });
