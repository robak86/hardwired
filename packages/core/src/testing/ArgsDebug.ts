export class ArgsDebug {
  public args: any[];

  constructor(...args: [any]) {
    this.args = args;
  }
}

export class TestClassArgs2 {
  constructor(public someNumber: number, public someString: string) {}
}
