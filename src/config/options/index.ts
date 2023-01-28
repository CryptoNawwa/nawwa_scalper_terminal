import { OptionValues, Command } from 'commander';
import { logger } from '../../logger';
import { SUPPORTED_EXCHANGE } from '../../_common/const';

const OptionsErrorReasons = {
  EXCHANGE_NOT_SUPPORTED: 'EXCHANGE_NOT_SUPPORTED',
};

export class Options {
  private readonly opts: OptionValues;

  public exchange: SUPPORTED_EXCHANGE | undefined = undefined;

  constructor() {
    const command = new Command();

    command
      .description('Nawwa scalper terminal')
      .option('-e, --exchange <binance | bybit>', 'exchange you want to connect to')
      .parse(process.argv);

    command.parse(process.argv);
    this.opts = command.opts();
  }

  public load() {
    try {
      if (this.opts.exchange) {
        this.loadExchange(this.opts.exchange);
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  private loadExchange(exchangeInput: string) {
    if (!Object.values(SUPPORTED_EXCHANGE).includes(exchangeInput as SUPPORTED_EXCHANGE)) {
      logger.error(`Exchange [${exchangeInput}] not supported.`);
      throw new Error(OptionsErrorReasons.EXCHANGE_NOT_SUPPORTED);
    }

    this.exchange = SUPPORTED_EXCHANGE[exchangeInput as SUPPORTED_EXCHANGE];
  }
}
