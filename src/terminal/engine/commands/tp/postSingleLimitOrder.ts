import chalk from 'chalk';
import { logger } from '../../../../logger';
import { isRefusal } from '../../../exchanges/_common/result';
import { type Position, type ExchangeMetadata, Side, Symbol } from '../../types';
import { calculateLimitOrderPrice } from '../_common/calculateLimitOrderPrice';

export type PostSingleLimitOrder = {
  symbol: Symbol;
  position: Position;
  exchange: ExchangeMetadata;
  awayFromEntry: number;
  shouldLog: boolean;
};

export const postSingleLimitOrder = async ({
  symbol,
  position,
  exchange,
  awayFromEntry,
  shouldLog,
}: PostSingleLimitOrder) => {
  const orderPrice = calculateLimitOrderPrice({
    awayInPercent: awayFromEntry,
    entryPrice: position.entry_price,
    side: position.side,
    priceScale: symbol.priceScale,
    tickSize: symbol.priceFilter.tickSize,
  });

  const hrstart = process.hrtime();
  const result = await exchange.instance.createPostLimitOrder({
    side: position.side === Side.LONG ? Side.SHORT : Side.LONG,
    symbol: position.symbol,
    quantity: position.size,
    price: orderPrice,
    reduceOnly: true,
  });
  const hrend = process.hrtime(hrstart);

  if (isRefusal(result)) {
    shouldLog && logger.warn(`Failed to create limit order, reason: ${chalk.italic(result.message)}`);
    return false;
  }

  shouldLog &&
    logger.success(
      `Take profit order placed at $${orderPrice}, for [${chalk.bold(symbol.name.toUpperCase())}] on ${
        exchange.instance.type
      }`,
    );

  logger.grey(`Request took ${(hrend[1] / 1000000).toFixed()}ms (roundtrip)`);

  exchange.currentActiveOrder.push(result.data);

  return true;
};
