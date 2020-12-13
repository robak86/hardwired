export class ArgsDebug {
  public args: any[];

  constructor(...args: [any]) {
    this.args = args;
  }
}

export class TestClass {
  constructor(public someNumber: number, public someString: string) {}
}
