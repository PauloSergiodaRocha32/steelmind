/** @deprecated Import from `@/providers/gestio` */
export { GestioClient, createGestioClient } from "@/providers/gestio/client";
export {
  CANONICAL_DIRECTORY,
  MATERIAL_PREFIX_TO_GROUP,
  SHAPE_CODE_TO_TAXONOMY,
  classifyProduct,
  parseProductCode,
} from "@/providers/gestio/taxonomy";
export {
  analyzeClassification,
  applyGestioClassification,
  syncGestioData,
  type ClassifyBatchResult,
  type ClassifyResult,
} from "@/providers/gestio/sync";
export {
  loadGestioSnapshot,
  requireGestioSnapshot,
} from "@/providers/gestio/snapshot";
