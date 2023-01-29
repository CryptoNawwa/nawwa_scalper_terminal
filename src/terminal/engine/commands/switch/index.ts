import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { SUPPORTED_EXCHANGE } from '../../../../_common/const';
import { COMMAND_VALUES } from '../const';

const isAnExchange = (value: string): value is SUPPORTED_EXCHANGE =>
  Object.values<string>(SUPPORTED_EXCHANGE).includes(value);

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.SWITCH.usage}`);

const WRONG_ARGUMENT_MSG = "Wrong argument for 'switch' command";

export const switchActive = async (args: string[], engine: Engine) => {
  if (args[0] === undefined || args.length > 1) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const possibleExchange = args[0].toLocaleLowerCase();
  if (isAnExchange(possibleExchange)) {
    engine.switchActiveExchange(possibleExchange);
    return true;
  }

  logger.error(`${WRONG_ARGUMENT_MSG} - '${possibleExchange}' is not supported`);
  printUsage();
  return false;
};
