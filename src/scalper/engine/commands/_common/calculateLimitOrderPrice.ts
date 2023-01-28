import { Side } from '../../types';
import { roundToTick } from './rountToTick';

type CalculateLimitOrderPriceParam = {
  entryPrice: number;
  awayInPercent: number;
  tickSize: number;
  priceScale: number;
  side: Side;
};

export const calculateLimitOrderPrice = ({
  entryPrice,
  awayInPercent,
  tickSize,
  priceScale,
  side,
}: CalculateLimitOrderPriceParam) => {
  const orderPriceRaw =
    side === Side.LONG ? entryPrice * (1 + awayInPercent / 100) : entryPrice * (1 - awayInPercent / 100);

  const orderPrice = parseFloat(roundToTick(orderPriceRaw, tickSize, priceScale));

  return orderPrice;
};
