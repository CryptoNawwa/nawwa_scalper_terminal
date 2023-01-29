import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES } from '../const';
import chalk from 'chalk';
import { Side } from '../../types';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.POSITION.usage}`);

export const position = async (args: string[], engine: Engine) => {
  if (args.length > 1) {
    printUsage();
    return false;
  }

  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.info(`No active exchange`);
    return false;
  }

  const refreshOption = args[0];
  if (refreshOption && refreshOption.toLowerCase() !== 'refresh') {
    printUsage();
    return false;
  }

  if (refreshOption) {
    logger.infoLoading(`Refreshing all positions from exchange...`);
    exchange.currentPositions = await exchange.instance.fetchCurrentPositions();
  }

  const currentPosition = exchange.currentPositions;
  if (currentPosition.length <= 0) {
    logger.info(`No current position oppened on ${exchange.instance.type}`);
    return false;
  }

  logger.info(`Current openned position on ${chalk.bold(exchange.instance.type)}: `);
  currentPosition.forEach(p => {
    const symbolAlone = p.symbol.endsWith('USDT') ? p.symbol.slice(0, -4) : p.symbol;

    logger.info(
      `[${chalk.bold(p.symbol)}] - ${p.side == Side.LONG ? chalk.green(p.side) : chalk.red(p.side)} - ${
        p.size
      } ${symbolAlone} at $${p.entry_price}`,
    );
  });

  return true;
};
