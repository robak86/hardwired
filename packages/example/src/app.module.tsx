import { module } from '@hardwired/core';
import React from 'react';
import { storeModule } from './state/store.module';

export const appModule = module('app').define('store', storeModule);
