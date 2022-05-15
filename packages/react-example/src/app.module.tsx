import React from 'react';
import { external, request, value } from 'hardwired';
import { CounterStore } from './counter/CounterStore.js';
import { CounterActions } from './counter/CounterActions.js';

export const counterInitialValueDef = value(0);
export const counterLabelValueDef = external('counterLabel').type<string>();

export const counterStoreDef = request.class(CounterStore, counterInitialValueDef, counterLabelValueDef);
export const counterActionsDef = request.class(CounterActions, counterStoreDef);
