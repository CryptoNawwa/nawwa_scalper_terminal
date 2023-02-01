import { logger } from '../../../../../logger';
import { printUsage } from '../index';
import type { Engine } from '../../../index';

const printErrorAndUsage = () => {
  logger.error(`Wrong argument for 'shortcut delete' command`);
  printUsage();
};

export const deleteShortcut = (shortcut: string | undefined, engine: Engine): boolean => {
  if (!shortcut) {
    printErrorAndUsage();
    return false;
  }

  const shortcutLowerCased = shortcut.toLowerCase();

  const toDelete = engine.shortcuts.getData()[shortcutLowerCased];
  if (!toDelete) {
    logger.warn(`No shortcut '${shortcutLowerCased}' found.`);

    return true;
  }

  engine.shortcuts.delete(shortcutLowerCased);
  logger.success(`Shortcut '${shortcutLowerCased}' was deleted`);
  return true;
};
