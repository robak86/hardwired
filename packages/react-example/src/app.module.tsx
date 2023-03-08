import React from 'react';
import { implicit, scoped, value } from 'hardwired';
import { CounterStore } from './counter/CounterStore.js';
import { CounterActions } from './counter/CounterActions.js';

export const counterInitialValueDef = value(0);
export const counterLabelValueDef = implicit<string>('counterLabel');

export const counterStoreDef = scoped.class(CounterStore, counterInitialValueDef, counterLabelValueDef);
export const counterActionsDef = scoped.class(CounterActions, counterStoreDef);
