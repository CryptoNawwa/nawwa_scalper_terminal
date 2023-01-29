import type { Engine } from '../../index';
import { logger } from '../../../../logger';

const DISCONNECT_CMD_USAGE = 'disconnect';
const WRONG_ARGUMENT_MSG = "Wrong argument for 'disconnect' command";
const ERROR_CMD_MSG = "Error with 'disconnect' command:";

const printUsage = () => logger.error(`Usage: ${DISCONNECT_CMD_USAGE}`);

export const disconnect = async (args: string[], engine: Engine) => {
  if (args.length > 0) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const activeExchange = engine.getCurrentActiveExchange();
  if (!activeExchange) {
    logger.error(`${ERROR_CMD_MSG} No current active exchange.`);
    return false;
  }

  const exchangeType = activeExchange.instance.type;

  await activeExchange.instance.closeWebSockets();
  engine.promptTextTemplate.activeExchangeName = undefined;
  engine.promptTextTemplate.activeSymbol = undefined;
  engine.activeExchange = undefined;
  engine.exchanges[exchangeType] = undefined;

  logger.success(`Disconnected from ${exchangeType}`);

  return true;
};
