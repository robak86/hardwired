import { selector } from "../state/reduxResolvers";
import { selectMatrixElements } from "./selectors/matrixSelectors";
import { module } from "hardwired";

export const matrixModule = module('matrix')
  .define('selectMatrixElements', selector(selectMatrixElements))

