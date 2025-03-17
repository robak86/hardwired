export class ExtensibleFunction extends Function {
  // @ts-expect-error
  constructor(f) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.setPrototypeOf(f, new.target.prototype);
  }
}
