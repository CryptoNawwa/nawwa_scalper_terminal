import chalk from 'chalk';

import type { Engine } from '../../../../../terminal/engine';
import { logger } from '../../../../../logger';

export const off = (engine: Engine) => {
  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.error(`No active exchange.`);
    return false;
  }

  engine.turnAutoTpOff();

  logger.info(`AutoTakeProfit system is now [${chalk.red('OFF')}] for ${chalk.bold(exchange.instance.type)}.`);
  return true;
};
