import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';

import { listShortcut } from './list';
import { addShortcut } from './add';
import { loadShortcut } from './load';
import { deleteShortcut } from './delete';

const WRONG_ARGUMENT_MSG = "Wrong argument for 'shortcut' command";
export const printUsage = () => logger.grey(`Usage:\n- ${COMMAND_VALUES.SHORTCUT.usage.join('\n- ')}`);

export const shortcut = async (args: string[], engine: Engine) => {
  if (args[0] === undefined) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const nestedCommand = args[0].toLowerCase();
  switch (nestedCommand) {
    case 'list':
      return listShortcut(engine);
    case 'add':
      return addShortcut(args.slice(1).join(' '), engine);
    case 'delete':
    case 'del':
      return deleteShortcut(args[1], engine);
    case 'load':
      return loadShortcut(engine);
    default:
      logger.error(`${nestedCommand} is not a valid command`);
      printUsage();
      return false;
  }
};
