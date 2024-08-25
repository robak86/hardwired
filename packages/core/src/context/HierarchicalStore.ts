export class HierarchicalStore {
  private ownEntries: Record<string, any> = {};

  constructor(
    // ids of instance definitions that should not be inherited from parent,
    // but stored in the current HierarchicalStore
    private ownDefinitionsIds: string[] = [],
    private parent: HierarchicalStore | undefined = undefined,
  ) {}

  checkoutChild(overriddenKeys: string[]): HierarchicalStore {
    return new HierarchicalStore(overriddenKeys, this);
  }

  set(key: string, value: any) {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      this.ownEntries[key] = value;
    } else {
      this.parent.set(key, value);
    }
  }

  get(key: string): any {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return this.ownEntries[key];
    } else {
      return this.parent.get(key);
    }
  }

  has(key: string): boolean {
    if (this.ownDefinitionsIds.includes(key) || !this.parent) {
      return !!this.ownEntries[key];
    }

    return this.parent.has(key);
  }
}
