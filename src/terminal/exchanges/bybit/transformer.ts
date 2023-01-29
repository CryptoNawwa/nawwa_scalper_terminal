import type { LinearOrder, PerpPosition } from 'bybit-api';
import { Position, Side, Symbol, ActiveOrder } from '../../engine/types';
import type { WebSocketPosition } from './types';
import type { SymbolInfo } from 'bybit-api';
import { SUPPORTED_EXCHANGE } from '../../../_common/const';

export const wsToPosition = (position: WebSocketPosition): Position => ({
  symbol: position.symbol,
  size: position.size,
  side: position.side.toLowerCase() == 'buy' ? Side.LONG : Side.SHORT,
  entry_price: position.entry_price,
});

export const toActiveOrder = (order: LinearOrder): ActiveOrder => ({
  orderId: order.order_id,
  symbol: order.symbol,
  from: SUPPORTED_EXCHANGE.bybit,
});

export const restToPositon = (position: PerpPosition): Position => ({
  symbol: position.symbol,
  size: position.size,
  side: position.side.toLowerCase() === 'buy' ? Side.LONG : Side.SHORT,
  entry_price: position.entry_price,
});

export const toSymbol = (symbol: SymbolInfo): Symbol => ({
  name: symbol.name,
  priceScale: symbol.price_scale,
  priceFilter: {
    minPrice: parseFloat(symbol.price_filter.min_price),
    maxPrice: parseFloat(symbol.price_filter.max_price),
    tickSize: parseFloat(symbol.price_filter.tick_size),
  },
  lotSizeFilter: {
    maxTradingQuantity: symbol.lot_size_filter.max_trading_qty,
    minTradingQuantity: symbol.lot_size_filter.min_trading_qty,
    quantityStep: symbol.lot_size_filter.qty_step,
  },
});
