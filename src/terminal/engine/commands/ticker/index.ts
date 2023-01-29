import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.TICKER.usage}`);
const WRONG_ARGUMENT_MSG = "Wrong argument for 'ticker' command";

export const ticker = async (args: string[], engine: Engine) => {
  if (args[0] === undefined || args.length > 1) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const rawArg = args[0].toUpperCase();
  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.error('No current active exchange.');
    return false;
  }

  if (rawArg == 'CLEAR') {
    engine.setActiveSymbolForExchange(exchange, undefined);
    return true;
  }

  const ticker = rawArg.endsWith('USDT') ? rawArg : `${rawArg}USDT`;

  const symbolFound = exchange.symbols.find(s => s.name.toLowerCase() === ticker.toLowerCase());

  if (!symbolFound) {
    logger.error(`Symbol ${ticker} not available on ${exchange.instance.type}`);
    return false;
  }

  engine.setActiveSymbolForExchange(exchange, symbolFound);
  return true;
};
