import type { FormatConfig, FormatPreset } from './types.js';

export const FORMATS: Record<Exclude<FormatPreset, 'custom'>, FormatConfig> = {
  standard: { id: 'standard', label: 'Standard', startingLife: 20, poisonLethal: 10 },
  commander: { id: 'commander', label: 'Commander', startingLife: 40, poisonLethal: 10 },
  twoHeadedGiant: { id: 'twoHeadedGiant', label: 'Two-Headed Giant', startingLife: 30, poisonLethal: 15 },
};

export function customFormat(startingLife: number): FormatConfig {
  return { id: 'custom', label: 'Custom', startingLife, poisonLethal: 10 };
}

export const DEFAULT_FORMAT: FormatConfig = FORMATS.standard;
