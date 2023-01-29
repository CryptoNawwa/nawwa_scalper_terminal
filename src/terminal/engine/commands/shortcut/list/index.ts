import { logger } from '../../../../../logger';
import type { Engine } from '../../../index';

export const listShortcut = (engine: Engine): boolean => {
  const shortcuts = Object.entries(engine.shortcuts.getData());

  if (!shortcuts.length || shortcuts.length === 0) {
    logger.log("You don't have any shortcut at the moment.");
    return true;
  }

  shortcuts.forEach(([key, value]) => {
    logger.log(`${key} -> ${value}`);
  });

  return true;
};
