import { ValueResolver } from 'hardwired';
import {Saga } from '@redux-saga/core'

export class SagaResolver<TReturn> extends ValueResolver<TReturn> {}

export const saga = <TSaga extends Saga>(saga: TSaga): SagaResolver<TSaga> => {
  return new SagaResolver(saga);
};
