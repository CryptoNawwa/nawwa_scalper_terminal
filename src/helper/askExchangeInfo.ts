import type { SUPPORTED_EXCHANGE } from '../_common/const';
import { prompt } from '../helper/prompt';
import { logger } from '../logger';

const isR = (str: string) => (str === 'r' ? true : false);
const isExit = (str: string) => (str === 'exit' ? true : false);

const printRetry = () => {
  console.clear();
  logger.log('Retrying..');
};

const askYesNo = (toAsk: string): boolean => {
  const endYes = ['y', 'yes', 'Y', 'YES'];
  const endNo = ['n', 'no', 'N', 'no'];

  const ends = [...endYes, ...endNo];

  let yesno = 'x';
  while (!ends.includes(yesno)) {
    yesno = prompt(toAsk);
  }

  if (endNo.includes(yesno)) return false;

  return true;
};

export const askExchangeApiInfo = (exchange: SUPPORTED_EXCHANGE): [string, string] => {
  const exchangeName = exchange.toString().toLowerCase();

  logger.log("Write 'r' to retry or 'exit' to quit.");

  const apiKey = prompt(`Enter your ${exchangeName} api key : `, { echo: '*' });
  if (isR(apiKey)) {
    printRetry();
    return askExchangeApiInfo(exchange);
  }

  if (isExit(apiKey)) {
    throw new Error('User exited');
  }

  const apiSecret = prompt(`Enter your ${exchangeName} api secret : `, { echo: '*' });
  if (isR(apiSecret)) {
    printRetry();
    return askExchangeApiInfo(exchange);
  }
  if (isExit(apiSecret)) {
    throw new Error('User exited');
  }

  const yes = askYesNo(`Are you sure the information is correct ? y/n `);

  if (yes) {
    logger.success('Perfect ! Saving api keys in config file.');
    return [apiKey, apiSecret];
  }

  printRetry();
  return askExchangeApiInfo(exchange);
};
