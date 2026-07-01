function parseBooleanFlag(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export interface SteelmindFeatureFlags {
  quoteEngineV2Enabled: boolean;
  quoteEngineV2ShadowMode: boolean;
  aiGroundedOnly: boolean;
}

export function getFeatureFlags(): SteelmindFeatureFlags {
  const quoteEngineV2Enabled = parseBooleanFlag(
    process.env.QUOTE_ENGINE_V2_ENABLED,
    false,
  );
  const quoteEngineV2ShadowMode = parseBooleanFlag(
    process.env.QUOTE_ENGINE_V2_SHADOW_MODE,
    true,
  );
  const aiGroundedOnly = parseBooleanFlag(process.env.AI_GROUNDED_ONLY, true);

  return {
    quoteEngineV2Enabled,
    quoteEngineV2ShadowMode,
    aiGroundedOnly,
  };
}
