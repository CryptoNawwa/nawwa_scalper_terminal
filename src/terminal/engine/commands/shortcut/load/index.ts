import type { Engine } from '../../../index';

export const loadShortcut = (engine: Engine): boolean => {
  engine.shortcuts.load();
  return true;
};
