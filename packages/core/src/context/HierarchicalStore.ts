export class HierarchicalStore {
  private ownEntries: Record<symbol, any> = {};

  constructor(
    private ownDefinitionsIds: symbol[] = [], // ids of instance definitions that should not be inherited from parent, but stored in current HierarchicalStore
    private parent: HierarchicalStore | undefined = undefined,
  ) {}

  checkoutChild(overriddenKeys: symbol[]): HierarchicalStore {
    return new HierarchicalStore(overriddenKeys, this);
  }

  set(key: symbol, value: any) {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      this.ownEntries[key] = value;
    } else {
      this.parent.set(key, value);
    }
  }

  get(key: symbol): any {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return this.ownEntries[key];
    } else {
      return this.parent.get(key);
    }
  }

  has(key: symbol): boolean {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return !!this.ownEntries[key];
    }

    return this.parent.has(key);
  }
}
