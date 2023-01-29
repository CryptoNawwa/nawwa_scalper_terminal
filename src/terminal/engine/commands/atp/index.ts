import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';
import { on } from './on';
import { off } from './off';
import { status } from './status';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.ATP.usage}`);
const WRONG_ARGUMENT_MSG = "Wrong argument for 'atp' command";

export const atp = async (args: string[], engine: Engine) => {
  if (args[0] === undefined) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const nestedCommand = args[0].toUpperCase();

  switch (nestedCommand) {
    case 'ON':
      return on(args, engine);
    case 'OFF':
      return off(engine);
    case 'UPDATE':
    case 'UP':
      return on(args, engine);
    case 'ST':
    case 'STATUS':
      return status(engine);
    default:
      logger.error(`${nestedCommand} is not a valid command`);
      printUsage();
      return false;
  }
};
