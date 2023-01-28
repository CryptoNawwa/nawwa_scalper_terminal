import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { isOk } from '../../../exchanges/_common/result';
import type { ExchangeSuccess } from '../../../exchanges/interface/index';
import type { CanceledOrder } from '../../types';

const CANCEL_CMD_USAGE = 'cancel';
const WRONG_ARGUMENT_MSG = "Wrong argument for 'cancel' command";
const CANNOT_EXECUTE_MSG = "cannot execute 'cancel' command.";

const printUsage = () => logger.error(`Usage: ${CANCEL_CMD_USAGE}`);

export const cancel = async (args: string[], engine: Engine) => {
  if (args.length > 0) {
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

  const toDelete = exchange.currentActiveOrder.filter(cav => cav.symbol === activeSymbol.name);

  if (toDelete.length <= 0) {
    logger.info(`No open orders to delet for ${activeSymbol.name}.`);
    return false;
  }

  const toDeletePromise = toDelete.map(toDel => {
    return exchange.instance.cancelActiveLimitOrder({
      orderId: toDel.orderId,
      symbol: toDel.symbol,
      from: exchange.instance.type,
    });
  });

  const hrstart = process.hrtime();
  const result = await Promise.all(toDeletePromise);
  const hrend = process.hrtime(hrstart);

  const successResult = result.filter(r => isOk(r)) as ExchangeSuccess<CanceledOrder>[];

  exchange.currentActiveOrder = exchange.currentActiveOrder.filter(o =>
    successResult.find(s => s.data.orderId !== o.orderId),
  );

  logger.success(`Managed to cancel ${successResult.length} orders.`);
  logger.grey(`Request took ${(hrend[1] / 1000000).toFixed()}ms`);

  return true;
};
