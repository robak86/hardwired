import { selectMatrixElements } from './selectors/matrixSelectors';
import { module } from 'hardwired';
import { storeModule } from '../state/store.module';
import { selector } from 'hardwired-redux';

export const matrixModule = module('matrix')
  .define('store', storeModule)
  .define('selectMatrixElements', selector(selectMatrixElements) as any, ['store.store']); //TODO
