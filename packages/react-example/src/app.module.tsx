import React from 'react';
import { external, request, value } from 'hardwired';
import { CounterStore } from './counter/CounterStore';
import { CounterActions } from './counter/CounterActions';

export const counterInitialValueDef = value(0);
export const counterLabelValueDef = external<string>();

export const counterStoreDef = request.class(CounterStore, counterInitialValueDef, counterLabelValueDef);
export const counterActionsDef = request.class(CounterActions, counterStoreDef);
