export class SingletonScope {
  private ownEntries: Record<string, any> = {};

  constructor(
    private ownOverriddenKeys: string[] = [],
    private parent: SingletonScope | undefined = undefined, // private nonOverridableKeys: string[] = [], //TODO
  ) {}

  checkoutChild(overriddenKeys: string[]): SingletonScope {
    return new SingletonScope(overriddenKeys, this);
  }

  set(key, value) {
    if (this.ownOverriddenKeys.includes(key) || !this.parent) {
      this.ownEntries[key] = value;
    } else {
      this.parent.set(key, value);
    }
  }

  get(key) {
    if (this.ownOverriddenKeys.includes(key) || !this.parent) {
      return this.ownEntries[key];
    } else {
      return this.parent.get(key);
    }
  }

  has(key: string) {
    if (this.ownOverriddenKeys.includes(key) || !this.parent) {
      return !!this.ownEntries[key];
    }

    return this.parent.has(key);
  }
}
