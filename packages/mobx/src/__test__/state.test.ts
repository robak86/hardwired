import { container } from 'hardwired';
import { state } from '../state';
import { isBoxedObservable } from 'mobx';

describe(`state`, () => {
  it(`wraps object into boxed observable`, async () => {
    const stateD = state({ myState: 1 });
    const stateObservable = container().get(stateD);
    expect(isBoxedObservable(stateObservable)).toEqual(true);
  });

  it(`acts like singleton`, async () => {
    const stateD = state({ myState: 1 });
    const cnt = container();

    const stateObservable1 = cnt.get(stateD);
    const stateObservable2 = cnt.get(stateD);
    expect(stateObservable1).toBe(stateObservable2);
  });
});
