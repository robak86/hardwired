import { CounterStore } from '../CounterStore.js';
import { CounterActions } from '../CounterActions.js';
import { container, set } from 'hardwired';
import { counterActionsDef, counterInitialValueDef, counterLabelValueDef, counterStoreDef } from '../../app.module.js';
import { describe, expect, it } from 'vitest';

describe('CounterAction', () => {
  describe('.increment()', () => {
    // manually creating instances
    it('increments counter state by 1', () => {
      const counterStore = new CounterStore(0, 'some label');
      const counterStoreActions = new CounterActions(counterStore);
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1);
    });

    // delegating instances construction to container
    it('increments counter state by 1', () => {
      const [counterStore, counterStoreActions] = container()
        .withImplicits(set(counterLabelValueDef, 'some label'))
        .getAll([counterStoreDef, counterActionsDef]);
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(1);
    });

    // delegating instances construction to container and overriding initial value for counter store
    it('increments counter state by 1', () => {
      const cnt = container([set(counterInitialValueDef, 10)]);

      const [counterStore, counterStoreActions] = cnt
        .withImplicits(set(counterLabelValueDef, 'some label'))
        .getAll([counterStoreDef, counterActionsDef]);
      counterStoreActions.increment();
      expect(counterStore.value).toEqual(11);
    });
  });
});
