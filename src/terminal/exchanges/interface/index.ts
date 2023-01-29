import type { JSONSync } from '../../../config/json';
import type { Position, Order, Symbol, ActiveOrder, CanceledOrder } from '../../engine/types';
import type { SUPPORTED_EXCHANGE } from '../../../_common/const';

export type WsExchangePositionUpdateCallbackFunction = (from: SUPPORTED_EXCHANGE, data: Position[]) => Promise<void>;

export type ExchangeError = {
  type: 'error';
  message: string;
};

export type ExchangeSuccess<T> = {
  type: 'success';
  data: T;
};

export type ExchangeResult<T> = ExchangeError | ExchangeSuccess<T>;

export abstract class Exchange {
  abstract readonly type: SUPPORTED_EXCHANGE;
  abstract readonly config: JSONSync;

  constructor() {}

  /**
   * Initialization
   */
  abstract connectToRestClient(): Promise<void>;
  abstract connectToWebSocket(): Promise<void>;

  /**
   * Callbacks
   */
  abstract enginePositionUpdateCallback: WsExchangePositionUpdateCallbackFunction | undefined;
  abstract setEnginePositionUpdateCallback(func: WsExchangePositionUpdateCallbackFunction): void;

  /**
   * Mutation
   */
  abstract createPostLimitOrder(order: Order): Promise<ExchangeResult<ActiveOrder>>;
  abstract cancelActiveLimitOrder(order: ActiveOrder): Promise<ExchangeResult<CanceledOrder>>;

  /**
   * Query
   */
  abstract fetchAvailableSymbols(): Promise<Symbol[]>;
  abstract fetchCurrentPositions(): Promise<Position[]>;

  /**
   * Misc
   */
  abstract closeWebSockets(): Promise<void>;
}
