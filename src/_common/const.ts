import chalk from 'chalk';

export const QUIT_CMDS = ['EXIT', 'QUIT'];

export enum SUPPORTED_EXCHANGE {
  binance = 'binance',
  bybit = 'bybit',
}

export const DEFAULT_EXCHANGES = {
  [SUPPORTED_EXCHANGE.binance]: undefined,
  [SUPPORTED_EXCHANGE.bybit]: undefined,
};

export const DEFAULT_CURSOR = chalk.magenta('> ');

export const APP_PATH = process.cwd();
