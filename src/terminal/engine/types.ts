import type { Exchange } from '../exchanges';
import type { SUPPORTED_EXCHANGE } from '../../_common/const';

export enum ATPType {
  SCALE = 'SCALE',
  TP = 'TP',
}

export type ATPScaleData = {
  type: ATPType.SCALE;
  shortcut: string;
  cancel: boolean;
  numberOfOrders: number;
  from: number;
  to: number;
};

export type ATPSingleData = {
  type: ATPType.TP;
  shortcut: string;
  cancel: boolean;
  awayFromEntry: number;
};

export type ATPData = ATPScaleData | ATPSingleData;

export enum Side {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export type Position = {
  symbol: string;
  size: number;
  side: Side;
  entry_price: number;
};

export type ActiveOrder = {
  orderId: string;
  symbol: string;
  from: SUPPORTED_EXCHANGE;
};

export type CanceledOrder = {
  orderId: string;
};

export type Order = {
  side: Side;
  symbol: string;
  quantity: number;
  price: number;
  reduceOnly: boolean;
};

export type Symbol = {
  name: string;
  priceScale: number;
  priceFilter: {
    minPrice: number; // is in string in bybit
    maxPrice: number;
    tickSize: number;
  };
  lotSizeFilter: {
    maxTradingQuantity: number;
    minTradingQuantity: number;
    quantityStep: number;
  };
};

export enum ENGINE_RETURN {
  EXIT = 'EXIT',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  NOTHING = 'NOTHING',
}

export type ExchangeMetadata = {
  instance: Exchange;
  activeSymbol?: Symbol;
  symbols: Symbol[];
  autoTakeProfit?: ATPData;
  currentPositions: Position[];
  currentActiveOrder: ActiveOrder[];
};

export type PromptTextTemplate = {
  cursor: string;
  activeSymbol?: string;
  activeExchangeName?: string;
  atpActive?: {
    shortcutName: string;
  };
};
