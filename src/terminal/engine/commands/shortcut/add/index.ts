import { logger } from '../../../../../logger';
import { printUsage } from '../index';
import type { Engine } from '../../../index';

const printErrorAndUsage = () => {
  logger.error(`Wrong argument for 'shortcut add' command`);
  printUsage();
};

export const addShortcut = (shortcut: string | undefined, engine: Engine): boolean => {
  if (!shortcut) {
    printErrorAndUsage();
    return false;
  }

  const [key, value] = shortcut.toLowerCase().split('=');
  if (!key || !value) {
    printErrorAndUsage();
    return false;
  }

  engine.shortcuts.new({ [key]: value });
  logger.success(`Shortcut '${key} -> ${value}' was added`);
  return true;
};
