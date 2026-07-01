export { GestioClient, createGestioClient } from "./client";
export {
  CANONICAL_DIRECTORY,
  MATERIAL_PREFIX_TO_GROUP,
  SHAPE_CODE_TO_TAXONOMY,
  classifyProduct,
  parseProductCode,
} from "./taxonomy";
export {
  analyzeClassification,
  applyGestioClassification,
  syncGestioData,
  type ClassifyBatchResult,
  type ClassifyResult,
} from "./sync";
export { loadGestioSnapshot, requireGestioSnapshot } from "./snapshot";
