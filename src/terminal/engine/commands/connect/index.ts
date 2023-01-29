import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { SUPPORTED_EXCHANGE } from '../../../../_common/const';

const CONNECT_CMD_USAGE = 'connect <bybit | binance>';

const isAnExchange = (value: string): value is SUPPORTED_EXCHANGE =>
  Object.values<string>(SUPPORTED_EXCHANGE).includes(value);

const printUsage = () => logger.error(`Usage: ${CONNECT_CMD_USAGE}`);

const WRONG_ARGUMENT_MSG = "Wrong argument for 'connect' command";

export const connect = async (args: string[], engine: Engine) => {
  if (args[0] === undefined || args.length > 1) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const possibleExchange = args[0].toLocaleLowerCase();
  if (isAnExchange(possibleExchange)) {
    await engine.connectToExchange(possibleExchange);
    return true;
  }

  logger.error(`${WRONG_ARGUMENT_MSG} - '${possibleExchange}' is not supported`);
  printUsage();
  return false;
};
