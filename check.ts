/**
 * Base class for extensible functions
 */
class ExtensibleFunction extends Function {
  // @ts-ignore
  constructor(f) {
    return Object.setPrototypeOf(f, new.target.prototype);
  }
}


interface Callable {
  (): string;
}

class Callable extends ExtensibleFunction {
  constructor() {
    super(() => {
      console.log('default called');
      return '123'
    });
  }

  foo() {
    console.log('foo called');
    return this;
  }
}

const c = new Callable();


const val = c()

console.log(val);
