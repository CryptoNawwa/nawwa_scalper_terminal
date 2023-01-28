import chalk from 'chalk';
import { logger } from '../../../../logger';
import type { ExchangeError, ExchangeSuccess } from '../../../exchanges';
import { isOk, isRefusal } from '../../../exchanges/_common/result';
import { type Position, type ExchangeMetadata, Side, Symbol, ActiveOrder } from '../../types';
import { calculateLimitOrderPrice } from '../_common/calculateLimitOrderPrice';
import { roundToTick } from '../_common/rountToTick';

export type PostScaleOrdersParam = {
  symbol: Symbol;
  position: Position;
  exchange: ExchangeMetadata;
  numberOfOrder: number;
  fromPercentage: number;
  toPercentage: number;
  shouldLog: boolean;
};

export const postScaleOrders = async ({
  symbol,
  position,
  exchange,
  numberOfOrder,
  fromPercentage,
  toPercentage,
  shouldLog,
}: PostScaleOrdersParam) => {
  const maxSizePerOrder = symbol.lotSizeFilter.maxTradingQuantity;
  const minSizePerOrder = symbol.lotSizeFilter.minTradingQuantity;
  const quantityPerOrder =
    Math.ceil(position.size / numberOfOrder / symbol.lotSizeFilter.quantityStep) * symbol.lotSizeFilter.quantityStep;
  const rawQuantity = position.size / numberOfOrder;

  if (quantityPerOrder > maxSizePerOrder) {
    shouldLog &&
      logger.error(
        `Scaling not wide enought,augment your number of orders, max size per limit order : ${maxSizePerOrder}`,
      );
    return false;
  }
  if (rawQuantity < minSizePerOrder) {
    shouldLog && logger.error(`Scaling too wide, reduce your number or order`);
    shouldLog &&
      logger.error(
        `Maximum number of orders for a size of ${position.size} is : ${Math.floor(position.size / minSizePerOrder)}`,
      );

    return false;
  }

  const entryPrice = position.entry_price;
  const symbolTickSize = symbol.priceFilter.tickSize;

  const fromPrice = calculateLimitOrderPrice({
    awayInPercent: fromPercentage,
    entryPrice,
    side: position.side,
    priceScale: symbol.priceScale,
    tickSize: symbolTickSize,
  });

  const toPrice = calculateLimitOrderPrice({
    awayInPercent: toPercentage,
    entryPrice,
    side: position.side,
    priceScale: symbol.priceScale,
    tickSize: symbolTickSize,
  });

  const createPostOrderPromises = [];
  const step = (toPrice - fromPrice) / (numberOfOrder - 1);

  for (var i = 0; i < numberOfOrder; i++) {
    const calculatedPrice = parseFloat(roundToTick(fromPrice + i * step, symbolTickSize, symbol.priceScale));
    createPostOrderPromises.push(
      exchange.instance.createPostLimitOrder({
        side: position.side === Side.LONG ? Side.SHORT : Side.LONG,
        symbol: position.symbol,
        quantity: quantityPerOrder,
        price: calculatedPrice,
        reduceOnly: true,
      }),
    );

    shouldLog &&
      logger.grey(`- order ${i + 1}/${numberOfOrder} sent to ${exchange.instance.type} at $${calculatedPrice}`);
  }

  const hrstart = process.hrtime();
  const result = await Promise.all(createPostOrderPromises);
  const hrend = process.hrtime(hrstart);

  const errorResult = result.filter(r => isRefusal(r)) as ExchangeError[];
  const successResult = result.filter(r => isOk(r)) as ExchangeSuccess<ActiveOrder>[];

  errorResult.forEach(r => {
    shouldLog && logger.warn(`Failed to create limit order, reason: ${chalk.italic(r.message)}`);
  });

  if (successResult.length > 0) {
    shouldLog &&
      logger.success(
        `${successResult.length} orders created for [${chalk.bold(symbol.name.toUpperCase())}] on ${
          exchange.instance.type
        }`,
      );
  }

  logger.grey(`Request took ${(hrend[1] / 1000000).toFixed()}ms`);

  exchange.currentActiveOrder = [...exchange.currentActiveOrder, ...successResult.map(r => r.data)];
  return true;
};
