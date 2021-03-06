import { module } from 'hardwired';
import React from 'react';
import { storeModule } from './state/store.module';

export const appModule = module().import('store', storeModule);
