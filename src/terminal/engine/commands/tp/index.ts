import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';
import { postSingleLimitOrder } from './postSingleLimitOrder';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.TP.usage}`);
const WRONG_ARGUMENT_MSG = "Wrong argument for 'tp' command";
const CANNOT_EXECUTE_MSG = "cannot execute 'tp' command.";

export const tp = async (args: string[], engine: Engine) => {
  if (args[0] === undefined || args.length > 1) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const awayFromEntry = parseFloat(args[0]);
  if (awayFromEntry <= 0.0) {
    logger.error(WRONG_ARGUMENT_MSG);
    return false;
  }

  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.error(`No active exchange, ${CANNOT_EXECUTE_MSG}`);
    return false;
  }

  const activeSymbol = exchange.activeSymbol;
  if (!activeSymbol) {
    logger.error(`No active ticker, ${CANNOT_EXECUTE_MSG}`);
    return false;
  }

  const currentPosition = exchange.currentPositions.find(p => p.symbol === activeSymbol.name);
  if (!currentPosition) {
    logger.error(`No current position found for symbol ${activeSymbol}, ${CANNOT_EXECUTE_MSG}`);
    return false;
  }

  const result = await postSingleLimitOrder({
    symbol: activeSymbol,
    awayFromEntry,
    position: currentPosition,
    exchange,
    shouldLog: true,
  });

  return result;
};
