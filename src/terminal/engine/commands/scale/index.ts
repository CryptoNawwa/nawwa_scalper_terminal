import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';
import { postScaleOrders } from './postScaleOrders';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.SCALE.usage}`);
const WRONG_ARGUMENT_MSG = "Wrong argument for 'scale' command";
const CANNOT_EXECUTE_MSG = "cannot execute 'scale' command.";

const isNumberPositiveAndNotNan = (value: number) => value > 0.0 && !isNaN(value);

export const scale = async (args: string[], engine: Engine) => {
  const numberOfOrder = parseFloat(args[0]);
  const fromPercentage = parseFloat(args[1]);
  const toPercentage = parseFloat(args[2]);

  if (
    !isNumberPositiveAndNotNan(numberOfOrder) ||
    !isNumberPositiveAndNotNan(fromPercentage) ||
    !isNumberPositiveAndNotNan(toPercentage)
  ) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
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
    logger.error(`No position found for symbol ${activeSymbol.name}, ${CANNOT_EXECUTE_MSG}`);
    return false;
  }

  const result = await postScaleOrders({
    position: currentPosition,
    symbol: activeSymbol,
    exchange,
    fromPercentage,
    toPercentage,
    numberOfOrder,
    shouldLog: true,
  });

  return result;
};
