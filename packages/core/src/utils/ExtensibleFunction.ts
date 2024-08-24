export class ExtensibleFunction extends Function {
  // @ts-expect-error
  constructor(f) {
    return Object.setPrototypeOf(f, new.target.prototype);
  }
}
