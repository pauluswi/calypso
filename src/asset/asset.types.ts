export const ASSET_TYPES = [
  "WEAPON",
  "ARMOR",
  "ACCESSORY",
  "CONSUMABLE",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];
