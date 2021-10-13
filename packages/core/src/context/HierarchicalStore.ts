export class HierarchicalStore {
  private ownEntries: Record<string, any> = {};

  constructor(
    private ownDefinitionsIds: string[] = [], // ids of instance definitions that should not be inherited from parent, but stored in current SingletonScope
    private parent: HierarchicalStore | undefined = undefined,
  ) {}

  checkoutChild(overriddenKeys: string[]): HierarchicalStore {
    return new HierarchicalStore(overriddenKeys, this);
  }

  set(key, value) {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      this.ownEntries[key] = value;
    } else {
      this.parent.set(key, value);
    }
  }

  get(key) {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return this.ownEntries[key];
    } else {
      return this.parent.get(key);
    }
  }

  has(key: string) {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return !!this.ownEntries[key];
    }

    return this.parent.has(key);
  }
}
