import { type CheckOptions, type Update } from '@tauri-apps/plugin-updater'

export const checkUpdateSafe = async (
  _options?: CheckOptions,
): Promise<Update | null> => {
  // Drift fork: app updater disabled — never call @tauri-apps/plugin-updater check()
  return null
}

export type { CheckOptions }
