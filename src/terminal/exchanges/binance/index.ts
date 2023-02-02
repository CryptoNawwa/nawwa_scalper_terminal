import type { Exchange, WsExchangePositionUpdateCallbackFunction } from '../interface';
import { SUPPORTED_EXCHANGE } from '../../../_common/const';
import { JSONSync } from '../../../config';
import { USDMClient, WebsocketClient, NewOrderError, WsUserDataEvents } from 'binance';
import { ensureApiKey } from '../_common/ensureApiKey';
import { logger } from '../../../logger';
import { TerminalError } from '../../../_common/error';
import { Order, Side, Symbol, ActiveOrder, CanceledOrder } from '../../engine/types';
import { toActiveOrder, toPostion, toSymbol, wsToPosition } from './transformer';
import { ok, refuse } from '../_common/result';
import { noLogger } from '../_common/websocketLoggers';

const instanceOfNewOrderError = (object: any): object is NewOrderError => {
  return 'code' in object;
};

const BinanceErrorReason = {
  CANNOT_LOAD_BINANCE_SYMBOL: 'CANNOT_LOAD_BINANCE_SYMBOL',
  CANNOT_FIND_SYMBOL: 'CANNOT_FIND_SYMBOL',
  REST_CLIENT_NOT_INITIALIZED: 'REST_CLIENT_NOT_INITIALIZED',
  WRONG_API_KEY: 'WRONG_API_KEY',
};

export class Binance implements Exchange {
  readonly type = SUPPORTED_EXCHANGE.binance;
  readonly config: JSONSync = new JSONSync('binance-api');

  enginePositionUpdateCallback: WsExchangePositionUpdateCallbackFunction | undefined = undefined;

  private client: USDMClient | undefined = undefined;
  private wsClient: WebsocketClient | undefined = undefined;

  constructor() {}

  public setEnginePositionUpdateCallback(func: WsExchangePositionUpdateCallbackFunction) {
    this.enginePositionUpdateCallback = func;
  }

  public async fetchCurrentPositions() {
    if (!this.client) throw new TerminalError(BinanceErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const positions = await this.client.getPositions();

    return positions.filter(p => p.positionAmt > 0 || p.positionAmt < 0).map(p => toPostion(p));
  }

  public async cancelActiveLimitOrder(order: ActiveOrder) {
    if (!this.client) throw new TerminalError(BinanceErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const result = await this.client.cancelOrder({
      orderId: parseInt(order.orderId),
      symbol: order.symbol,
    });

    if (!result) return refuse('Problem with binance api');
    if (result.orderId <= 0) return refuse('Could not cancel order');

    return ok<CanceledOrder>({ orderId: result.orderId.toString() });
  }

  public async createPostLimitOrder(order: Order) {
    if (!this.client) throw new TerminalError(BinanceErrorReason.REST_CLIENT_NOT_INITIALIZED);

    try {
      const result = await this.client.submitNewOrder({
        symbol: order.symbol,
        side: order.side === Side.LONG ? 'BUY' : 'SELL',
        type: 'LIMIT',
        timeInForce: 'GTC',
        quantity: order.quantity,
        reduceOnly: order.reduceOnly ? 'true' : 'false',
        price: order.price,
      });

      if (!result) {
        return refuse(`Could not create limit order for binance `);
      }

      if (instanceOfNewOrderError(result)) {
        return refuse(`${result.msg} - code: ${result.code.toString()}`);
      }

      return ok<ActiveOrder>(toActiveOrder(result));
    } catch (err: any) {
      const msg = err?.message;
      return refuse(typeof msg === 'string' ? msg : 'Unknown error from Binance when posting order');
    }
  }

  private webSocketUpdateReceive = async (data: WsUserDataEvents) => {
    if (data.eventType == 'ACCOUNT_UPDATE') {
      if (!this.enginePositionUpdateCallback) return;
      await this.enginePositionUpdateCallback(
        SUPPORTED_EXCHANGE.binance,
        data.updateData.updatedPositions.map(p => wsToPosition(p)),
      );
      return;
    }
  };

  public async connectToWebSocket() {
    logger.infoLoading('Trying to connect to binance websockets...');

    const { apiKey, apiSecret } = ensureApiKey(this.config);

    const wsClient = new WebsocketClient(
      {
        api_key: apiKey,
        api_secret: apiSecret,
        beautify: true,
      },
      noLogger,
    );

    logger.success('Connected to binance websockets');

    wsClient.on('open', data => {});

    wsClient.on('formattedUserDataMessage', data => {
      this.webSocketUpdateReceive(data)
        .then()
        .catch(err => {
          console.error(err);
        })
        .finally();
    });

    wsClient.on('reply', data => {});

    wsClient.on('reconnecting', data => {
      console.log('ws automatically reconnecting.... ', data?.wsKey);
    });

    wsClient.on('reconnected', data => {
      console.log('ws has reconnected ', data?.wsKey);
    });

    wsClient.on('error', data => {
      logger.error(`Websocket error :${data?.wsKey}`);
    });

    wsClient.subscribeUsdFuturesUserDataStream();
  }

  public async connectToRestClient() {
    logger.infoLoading('Trying to connect to binance REST api...');

    const { apiKey, apiSecret } = ensureApiKey(this.config);

    this.client = new USDMClient({
      api_key: apiKey,
      api_secret: apiSecret,
    });

    await this.client.getAccountInformation();

    logger.success('Connected to binance REST api !');
  }

  public async fetchAvailableSymbols(): Promise<Symbol[]> {
    if (!this.client) throw new TerminalError(BinanceErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const symbols = await this.client.getExchangeInfo();

    if (!symbols || symbols.symbols.length <= 0) {
      logger.error(`Cannot fetch symbols from binance`);
      throw new TerminalError(BinanceErrorReason.CANNOT_LOAD_BINANCE_SYMBOL);
    }

    return symbols.symbols.map(s => toSymbol(s));
  }

  public async closeWebSockets() {
    if (!this.wsClient) return;

    try {
      this.wsClient.closeAll();
    } catch (err) {}
  }
}
