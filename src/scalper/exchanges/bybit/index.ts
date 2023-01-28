import { SUPPORTED_EXCHANGE } from '../../../_common/const';
import type { Exchange, WsExchangePositionUpdateCallbackFunction } from '../interface';
import { JSONSync } from '../../../config/json/index';
import { LinearClient, WebsocketClient } from 'bybit-api';
import { logger } from '../../../logger';
import { ensureApiKey } from '../_common/ensureApiKey';
import { ScalperError } from '../../../_common/error';
import type { WebSocketPosition, WebSocketUpdate } from './types';
import { restToPositon, wsToPosition, toSymbol, toActiveOrder } from './transformer';
import _ from 'lodash';
import { Order, Side, Symbol, ActiveOrder, CanceledOrder } from '../../engine/types';
import { noLogger } from './wsLogger';
import { ok, refuse } from '../_common/result';

const BybitErrorReason = {
  CANNOT_FIND_SYMBOL: 'CANNOT_FIND_SYMBOL',
  REST_CLIENT_NOT_INITIALIZED: 'REST_CLIENT_NOT_INITIALIZED',
  RET_CODE_NOK: 'RET_CODE_NOK',
};
export class Bybit implements Exchange {
  readonly type = SUPPORTED_EXCHANGE.bybit;
  readonly config: JSONSync = new JSONSync('bybit-api');

  private client: LinearClient | undefined = undefined;
  private wsClient: WebsocketClient | undefined = undefined;

  enginePositionUpdateCallback: WsExchangePositionUpdateCallbackFunction | undefined = undefined;

  constructor() {}

  public setEnginePositionUpdateCallback(func: WsExchangePositionUpdateCallbackFunction) {
    this.enginePositionUpdateCallback = func;
  }

  public async cancelActiveLimitOrder(order: ActiveOrder) {
    if (!this.client) throw new ScalperError(BybitErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const result = await this.client.cancelActiveOrder({ order_id: order.orderId, symbol: order.symbol });

    if (!result || !result.result) {
      return refuse('Problem with bybit API');
    }

    if (result.ret_msg == 'OK' && result.result) {
      return ok<CanceledOrder>({ orderId: result.result.order_id });
    }

    return refuse(result.ret_msg);
  }

  public async createPostLimitOrder(order: Order) {
    if (!this.client) throw new ScalperError(BybitErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const result = await this.client.placeActiveOrder({
      symbol: order.symbol,
      side: order.side == Side.LONG ? 'Buy' : 'Sell',
      order_type: 'Limit',
      price: order.price,
      qty: order.quantity,
      time_in_force: 'PostOnly',
      reduce_only: order.reduceOnly,
      close_on_trigger: false,
      position_idx: 0,
    });

    if (!result || !result.result) {
      return refuse('Problem with bybit API');
    }

    if (result.ret_msg == 'OK' && result.result) {
      return ok<ActiveOrder>(toActiveOrder(result.result));
    }

    return refuse(result.ret_msg);
  }

  public async connectToRestClient() {
    logger.infoLoading('Trying to connect to bybit REST api...');

    const { apiKey, apiSecret } = ensureApiKey(this.config);

    this.client = new LinearClient({
      key: apiKey,
      secret: apiSecret,
      testnet: false,
    });

    const apiKeyInfo = await this.client.getApiKeyInfo();

    if (apiKeyInfo.ret_msg == 'OK') {
      logger.success('Connected to bybit REST api !');
      return;
    }

    if (apiKeyInfo.ret_code == 10003 || apiKeyInfo.ret_code == 10004) {
      logger.error('API keys are probably invalid.');
      throw new ScalperError(apiKeyInfo.ret_msg);
    }

    throw new ScalperError(apiKeyInfo.ret_msg);
  }

  public async fetchCurrentPositions() {
    if (!this.client) throw new ScalperError(BybitErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const positionsResult = await this.client.getPosition();

    if (positionsResult.ret_msg !== 'OK') {
      throw new ScalperError(BybitErrorReason.RET_CODE_NOK, {
        origin: 'loadCurrentPosition',
        code: positionsResult.ret_code,
        msg: positionsResult.ret_msg,
      });
    }

    return _.compact(
      positionsResult.result.map(p => {
        return p.data.position_value > 0 ? restToPositon(p.data) : undefined;
      }),
    );
  }

  private async webSocketUpdateReceive(websocketResult: WebSocketUpdate) {
    const topic = websocketResult.topic;

    if (topic === 'position') {
      if (!this.enginePositionUpdateCallback) return;

      await this.enginePositionUpdateCallback(
        SUPPORTED_EXCHANGE.bybit,
        (websocketResult.data as WebSocketPosition[]).map(p => wsToPosition(p)),
      );
      return;
    }
  }

  public async connectToWebSocket() {
    logger.infoLoading('Trying to connect to bybit websocket...');

    const { apiKey, apiSecret } = ensureApiKey(this.config);

    this.wsClient = new WebsocketClient(
      {
        key: apiKey,
        secret: apiSecret,
        market: 'linear',
        testnet: false,
      },
      noLogger,
    );

    this.wsClient.subscribe(['position'], true);

    this.wsClient.on('update', data => {
      this.webSocketUpdateReceive(data)
        .then()
        .catch(err => {
          console.error(err);
        })
        .finally();
    });

    this.wsClient.on('open', ({ wsKey, event }) => {
      logger.success(`Connection openned for Bybit websocket with ID: ${wsKey}`);
    });

    this.wsClient.on('reconnect', ({ wsKey }) => {
      logger.log('Bybit websocket automatically reconnecting.... ');
    });

    this.wsClient.on('reconnected', data => {
      logger.log('Bybit websocket has reconnected ');
    });

    this.wsClient.on('error', data => {
      logger.error('Bybit websocket error');
      console.error(data);
    });
  }

  public async closeWebSockets() {
    if (!this.wsClient) return;

    try {
      this.wsClient.closeAll();
    } catch (err) {}
  }

  public async fetchAvailableSymbols(): Promise<Symbol[]> {
    if (!this.client) throw new ScalperError(BybitErrorReason.REST_CLIENT_NOT_INITIALIZED);

    const symbols = await this.client.getSymbols();

    if (symbols.ret_msg != 'OK') {
      logger.error(`Cannot load symbols ${symbols.ret_msg}`);
      throw new ScalperError(symbols.ret_msg);
    }

    const a = symbols.result.map(s => toSymbol(s));
    const sol = a.filter(ab => ab.name == 'SOLUSDT');
    console.log(sol);
    return a;
  }
}
