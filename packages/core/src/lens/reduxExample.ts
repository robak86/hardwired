import { lens, lensLeft } from './lens';
import { createSelector } from 'reselect';

type State = {
  a: StateA;
  b: {
    c: StateC;
  };
};

type StateC = {
  stateCProp: string;
};

type StateA = {
  stateAProp: string;
};

export const a = 1;

const stateAL = lensLeft<State>().fromProp('a');
const stateCL = lens<StateC>().fromPath(['b', 'c']);
//
// const buildState = Pipe.empty()
//   .map(stateAL.extend({ stateAProp: 'stateA' }))
//   .map(stateCL.extend({ stateCProp: 'stateA' }));
//
// const state = buildState.run({});
//
// const stateWithOverrides = buildState.map(stateCL.set({ stateCProp: 'new value' })).run({});
//
// const selector = createSelector([stateCL.get], a => {
//   a?.stateCProp; //TODO: a should not be undefined
// });
