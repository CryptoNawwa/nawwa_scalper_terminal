import chalk from 'chalk';
import { logger } from '../../../../../logger';
import type { Engine } from '../../../index';

export const status = (engine: Engine) => {
  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.error(`No active exchange.`);
    return false;
  }

  const atp = exchange.autoTakeProfit;

  if (!atp) {
    logger.info(`AutoTakeProfit system is [${chalk.red('OFF')}].`);
    return true;
  }

  logger.info(`AutoTakeProfit system is [${chalk.green('ON')}].`);
  logger.info(`AutoTakeProfit system is currently using the ${chalk.bold(atp.shortcut)} shortcut.`);
  return true;
};
