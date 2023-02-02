import chalk from 'chalk';

import { JSONSync, Options } from '../../config';
import { SUPPORTED_EXCHANGE, DEFAULT_CURSOR, QUIT_CMDS, DEFAULT_EXCHANGES } from '../../_common/const';
import { logger } from '../../logger';
import { isACommand, MAP_USER_INPUT_TO_COMMAND } from './commands/const';
import { Bybit, Binance } from '../exchanges';
import bluebird from 'bluebird';
import { handleError, TerminalError } from '../../_common/error';
import { PromptTextTemplate, ENGINE_RETURN, ExchangeMetadata, Position, Symbol, ATPData, ATPType } from './types';
import type { Exchange } from '../exchanges/interface/index';
import { askExchangeApiInfo } from '../../helper/askExchangeInfo';
import { postScaleOrders } from './commands/scale/postScaleOrders';
import { postSingleLimitOrder } from './commands/tp/postSingleLimitOrder';

const EngineErrorReason = {
  EXCHANGE_NOT_SUPORTED: 'EXCHANGE_NOT_SUPORTED',
  WRONG_INDEX_TO_SET_EXCHANGE_ACTIVE: 'WRONG_INDEX_TO_SET_EXCHANGE_ACTIVE',
  NO_ACTIVE_EXCHANGE_FOUND: 'NO_ACTIVE_EXCHANGE_FOUND',
};

export class Engine {
  options: Options;
  shortcuts: JSONSync;

  exchanges: Record<SUPPORTED_EXCHANGE, ExchangeMetadata | undefined> = DEFAULT_EXCHANGES;
  activeExchange: SUPPORTED_EXCHANGE | undefined = undefined;

  promptTextTemplate: PromptTextTemplate = { cursor: DEFAULT_CURSOR };

  constructor() {
    this.options = new Options();
    this.shortcuts = new JSONSync('shortcuts');
  }

  public async initialize() {
    this.options.load();
    this.shortcuts.load();

    if (this.options.exchange) {
      await this.connectToExchange(this.options.exchange);
    }
  }

  public setActiveSymbolForExchange(exchangeMetadata: ExchangeMetadata, symbol: Symbol | undefined) {
    exchangeMetadata.activeSymbol = symbol;
    this.promptTextTemplate.activeSymbol = symbol ? symbol.name : undefined;
  }

  public getCurrentActiveExchange() {
    return this.activeExchange ? this.exchanges[this.activeExchange] : undefined;
  }

  private getApiKeyForExchange(exchange: Exchange) {
    exchange.config.load();

    const { apiKey, apiSecret } = exchange.config.getData();

    if (!apiKey || !apiSecret) {
      const result = askExchangeApiInfo(exchange.type);

      const [newApiKey, newApiSecret] = result;

      console.log(newApiKey, newApiSecret);
      exchange.config.new({ apiKey: newApiKey, apiSecret: newApiSecret });
    }
  }

  private async doAutoTakeProfitSytem(positions: Position[], exchange: ExchangeMetadata, atpData: ATPData) {
    logger.infoLoading('AutoTakeProfit system triggered');
    await bluebird.each(positions, async position => {
      const symbol = exchange.symbols.find(s => s.name === position.symbol);

      if (!symbol) {
        throw new TerminalError(`ATP - Symbol ${position.symbol} not available on exchange ${exchange.instance.type}`);
      }

      const common = { symbol, position, exchange, shouldLog: true };
      switch (atpData.type) {
        case ATPType.SCALE:
          await postScaleOrders({
            ...common,
            numberOfOrder: atpData.numberOfOrders,
            fromPercentage: atpData.from,
            toPercentage: atpData.to,
          });
          break;
        case ATPType.TP:
          await postSingleLimitOrder({
            ...common,
            awayFromEntry: atpData.awayFromEntry,
          });
          break;
        default:
          break;
      }
    });
  }

  private async callbackPositionUpdated(from: SUPPORTED_EXCHANGE, updatedPositions: Position[]) {
    if (this.activeExchange !== from) {
      logger.grey(`Received websocket update from '${from}' but ignored since it's not the current active exchange`);
      return;
    }
    const activeExchange = this.exchanges[from];
    if (!activeExchange) {
      logger.error(`Error in websocket callback from exchange ${from}`);
      throw new TerminalError(EngineErrorReason.NO_ACTIVE_EXCHANGE_FOUND);
    }

    const filteredPositions = updatedPositions.filter(pos => pos.size > 0);
    const saveCurrentPos = [...activeExchange.currentPositions];
    activeExchange.currentPositions = filteredPositions;

    if (!activeExchange.autoTakeProfit) return;

    const newPositions = filteredPositions.filter(p => {
      const existing = saveCurrentPos.find(cp => cp.symbol === p.symbol);
      if (!existing || p.size > existing.size) return true;

      return false;
    });

    if (newPositions.length) {
      await this.doAutoTakeProfitSytem(newPositions, activeExchange, activeExchange.autoTakeProfit);
    }
  }

  public turnAutoTpOff() {
    const exchange = this.getCurrentActiveExchange();
    if (!exchange) {
      logger.error(`No active exchange.`);
      return false;
    }

    exchange.autoTakeProfit = undefined;
    this.promptTextTemplate.atpActive = undefined;
  }

  public switchActiveExchange(switchTo: SUPPORTED_EXCHANGE) {
    if (this.activeExchange === switchTo) {
      logger.log(`Exchange ${switchTo} is already active.`);
      return;
    }

    if (this.exchanges[switchTo] === undefined) {
      logger.error(`Not connected to ${switchTo} yet, use 'connect' cmd instead.`);
      return;
    }

    const activeExchange = this.activeExchange ? this.exchanges[this.activeExchange] : undefined;
    if (activeExchange) {
      activeExchange.activeSymbol = undefined;
    }

    this.activeExchange = switchTo;
    this.promptTextTemplate.activeExchangeName = switchTo;
    this.promptTextTemplate.activeSymbol = undefined;

    this.turnAutoTpOff();
    logger.log(`Active exchange is now: ${switchTo}`);
  }

  private async connectToNewExchange(connectTo: SUPPORTED_EXCHANGE) {
    let exchange: Exchange;

    switch (connectTo) {
      case SUPPORTED_EXCHANGE.binance:
        exchange = new Binance();
        break;
      case SUPPORTED_EXCHANGE.bybit:
        exchange = new Bybit();
        break;
      default:
        throw new TerminalError(EngineErrorReason.EXCHANGE_NOT_SUPORTED);
    }

    try {
      this.getApiKeyForExchange(exchange);
      exchange.setEnginePositionUpdateCallback(async (from: SUPPORTED_EXCHANGE, updatedPositions: Position[]) => {
        await this.callbackPositionUpdated(from, updatedPositions);
      });
      await exchange.connectToRestClient();
      await exchange.connectToWebSocket();

      const symbols = await exchange.fetchAvailableSymbols();
      logger.info(`${symbols.length} symbol(s) detected for ${exchange.type}`);

      const currentPositions = await exchange.fetchCurrentPositions();
      logger.info(`${currentPositions.length} position(s) openned on ${exchange.type}`);

      this.exchanges[connectTo] = {
        instance: exchange,
        symbols,
        currentPositions,
        currentActiveOrder: [],
      };

      this.activeExchange = connectTo;
      this.promptTextTemplate.activeSymbol = undefined;
      this.promptTextTemplate.activeExchangeName = exchange.type;

      logger.log(`Active exchange is now: ${exchange.type}`);
    } catch (err) {
      handleError(err);
      return;
    }
  }

  public async connectToExchange(connectTo: SUPPORTED_EXCHANGE) {
    if (this.exchanges[connectTo] !== undefined) {
      logger.log(`Already connected to exchange ${connectTo}`);
      this.switchActiveExchange(connectTo);
      return;
    }

    await this.connectToNewExchange(connectTo);
  }

  public getPromptTextFormatted() {
    const { cursor, activeExchangeName, activeSymbol, atpActive } = this.promptTextTemplate;

    const exchangeName = activeExchangeName ? chalk.cyan(activeExchangeName) : '';
    const symbol = activeSymbol ? ` - ${chalk.cyan(activeSymbol)}` : '';
    const atp = atpActive ? ` - ${chalk.bold(chalk.green('[ATP ON]'))}` : '';

    return `${exchangeName}${symbol}${atp} ${cursor} `.trim();
  }

  public async shutdown() {
    return bluebird.each(Object.entries(this.exchanges), async ([name, exchange]) => {
      if (!exchange) return;

      await exchange.instance.closeWebSockets();
      this.exchanges[exchange.instance.type] = undefined;
      logger.grey(`Connection closed for ${name}`);
    });
  }

  private getCommandOrShortcut(userInput: string) {
    const shortcutList = Object.entries(this.shortcuts.getData());

    const shortcut = shortcutList.find(([key]) => key.toLowerCase() === userInput.toLowerCase());
    if (!shortcut) {
      const [first, ...rest] = userInput.toUpperCase().split(' ');

      const nestedShortcut = shortcutList.find(([key]) => key.toLowerCase() === first.toLowerCase());

      if (nestedShortcut) {
        const [, value] = nestedShortcut;

        logger.grey(
          `Using nested shortcut value '${chalk.italic(value)}' for input '${chalk.italic(first.toLowerCase())}'`,
        );
        return [value.toUpperCase(), ...rest];
      }

      return [first, ...rest];
    }

    const [, shortcutValue] = shortcut;

    logger.grey(`Using shortcut value '${chalk.italic(shortcutValue)}' for input '${chalk.italic(userInput)}'`);
    return shortcutValue.toUpperCase().split(' ');
  }

  public async runCommand(userInput: string) {
    try {
      if (userInput == '') return;
      const [command, ...commandArgs] = this.getCommandOrShortcut(userInput.trim());

      if (QUIT_CMDS.includes(command)) {
        await this.shutdown();
        return ENGINE_RETURN.EXIT;
      }

      if (isACommand(command)) {
        const success = await MAP_USER_INPUT_TO_COMMAND[command](commandArgs, this);

        return success ? ENGINE_RETURN.SUCCESS : ENGINE_RETURN.FAILED;
      }

      logger.grey(`'${command.toLowerCase()}' is not a valid command.`);
      return ENGINE_RETURN.NOTHING;
    } catch (err) {
      handleError(err);
      return ENGINE_RETURN.FAILED;
    }
  }
}
