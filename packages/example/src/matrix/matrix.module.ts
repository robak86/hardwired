import { selector } from "../state/reduxResolvers";
import { selectMatrixElements } from "./selectors/matrixSelectors";
import { module } from "hardwired";
import { component } from "hardwired-react";
import { Matrix } from "./components/Matrix";

export const matrixModule = module('matrix')
  .define('selectMatrixElements', _ => selector(selectMatrixElements))
  .define('MatrixContainer', _ => component(Matrix, { elements: _.selectMatrixElements }));
