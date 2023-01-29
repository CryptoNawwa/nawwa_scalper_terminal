import type {
  FuturesPosition,
  FuturesSymbolExchangeInfo,
  NewOrderResult,
  SymbolLotSizeFilter,
  SymbolPriceFilter,
  WsUpdatedPosition,
} from 'binance';
import { ActiveOrder, Position, Symbol, Side } from '../../engine/types';
import { SUPPORTED_EXCHANGE } from '../../../_common/const';
import { TerminalError } from '../../../_common/error';

const numberOrStringToNumber = (data: number | string) => (typeof data === 'string' ? parseFloat(data) : data);

export const toActiveOrder = (order: NewOrderResult): ActiveOrder => ({
  orderId: order.clientOrderId.toString(),
  symbol: order.symbol,
  from: SUPPORTED_EXCHANGE.binance,
});

export const wsToPosition = (position: WsUpdatedPosition): Position => ({
  symbol: position.symbol,
  size: position.positionAmount < 0 ? position.positionAmount * -1 : position.positionAmount,
  side: position.positionAmount < 0 ? Side.SHORT : Side.LONG,
  entry_price: position.entryPrice,
});

export const toPostion = (position: FuturesPosition): Position => {
  const size = numberOrStringToNumber(position.positionAmt);

  return {
    symbol: position.symbol,
    size: size < 0 ? size * -1 : size,
    side: size < 0 ? Side.SHORT : Side.LONG,
    entry_price: numberOrStringToNumber(position.entryPrice),
  };
};

export const toSymbol = (symbol: FuturesSymbolExchangeInfo): Symbol => {
  const priceFilter = symbol.filters.find(filter => filter.filterType === 'PRICE_FILTER') as
    | SymbolPriceFilter
    | undefined;
  const lotSizeFilter = symbol.filters.find(filter => filter.filterType === 'LOT_SIZE') as
    | SymbolLotSizeFilter
    | undefined;

  if (!priceFilter || !lotSizeFilter) {
    throw new TerminalError('Missing data for symbol', { name: symbol.symbol });
  }

  return {
    name: symbol.symbol,
    priceScale: symbol.pricePrecision,
    priceFilter: {
      minPrice: numberOrStringToNumber(priceFilter.minPrice),
      maxPrice: numberOrStringToNumber(priceFilter.maxPrice),
      tickSize: numberOrStringToNumber(priceFilter.tickSize),
    },
    lotSizeFilter: {
      maxTradingQuantity: numberOrStringToNumber(lotSizeFilter.maxQty),
      minTradingQuantity: numberOrStringToNumber(lotSizeFilter.minQty),
      quantityStep: numberOrStringToNumber(lotSizeFilter.stepSize),
    },
  };
};
