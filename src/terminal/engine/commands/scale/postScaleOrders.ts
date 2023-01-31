import chalk from 'chalk';
import _ from 'lodash';
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

const calculateOrderQuantities = (totalQuantity: number, numOrders: number, quantityStep: number): number[] => {
  const orderQuantities = [];
  const singleOrderQuantity = Math.floor(totalQuantity / numOrders / quantityStep) * quantityStep;
  const remainingQuantity = totalQuantity - singleOrderQuantity * numOrders;
  for (let i = 0; i < numOrders; i++) {
    if (i < remainingQuantity / quantityStep) {
      orderQuantities.push(singleOrderQuantity + quantityStep);
    } else {
      orderQuantities.push(singleOrderQuantity);
    }
  }

  return orderQuantities.map(q => Number(q.toFixed(1)));
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
  const {
    lotSizeFilter: { maxTradingQuantity: maxSizePerOrder, minTradingQuantity: minSizePerOrder, quantityStep },
  } = symbol;

  const rawQuantity = position.size / numberOfOrder;
  if (rawQuantity > maxSizePerOrder) {
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

  const quantities = calculateOrderQuantities(position.size, numberOfOrder, quantityStep);

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
  const logsArray = [];
  const step = (toPrice - fromPrice) / (numberOfOrder - 1);

  for (var i = 0; i < numberOfOrder; i++) {
    const calculatedPrice = parseFloat(roundToTick(fromPrice + i * step, symbolTickSize, symbol.priceScale));
    createPostOrderPromises.push(
      exchange.instance.createPostLimitOrder({
        side: position.side === Side.LONG ? Side.SHORT : Side.LONG,
        symbol: position.symbol,
        quantity: quantities[i],
        price: calculatedPrice,
        reduceOnly: true,
      }),
    );

    logsArray.push(
      `- order ${i + 1}/${numberOfOrder} sent to ${exchange.instance.type} at $${calculatedPrice} - qty ${
        quantities[i]
      } `,
    );
  }

  const hrstart = process.hrtime();
  const result = await Promise.all(createPostOrderPromises);
  const hrend = process.hrtime(hrstart);

  const errorResult = result.filter(r => isRefusal(r)) as ExchangeError[];
  const successResult = result.filter(r => isOk(r)) as ExchangeSuccess<ActiveOrder>[];

  shouldLog && logger.grey(logsArray.join('\n'));
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

  logger.grey(`Request took ${(hrend[1] / 1000000).toFixed()}ms (roundtrip)`);

  exchange.currentActiveOrder = [...exchange.currentActiveOrder, ...successResult.map(r => r.data)];
  return true;
};
