import { CounterStore } from "../CounterStore";
import { CounterActions } from "../CounterActions";
import { container, set } from "hardwired";
import { counterActionsDef, counterInitialValueDef, counterStoreDef } from "../../app.module";

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
            const [counterStore, counterStoreActions] = container().getAll(counterStoreDef, counterActionsDef, 'some label');
            counterStoreActions.increment();
            expect(counterStore.value).toEqual(1);
        });

        // delegating instances construction to container and overriding initial value for counter store
        it('increments counter state by 1', () => {
            const cnt = container([set(counterInitialValueDef, 10)]);
            const [counterStore, counterStoreActions] = cnt.getAll(counterStoreDef, counterActionsDef);
            counterStoreActions.increment();
            expect(counterStore.value).toEqual(11);
        });
    });
});
