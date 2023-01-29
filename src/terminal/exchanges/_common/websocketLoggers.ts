import { DefaultLogger, LogParams } from 'bybit-api';

export const noLogger = {
  silly: (...params: LogParams) => {},
  debug: (...params: LogParams) => {},
  notice: (...params: LogParams) => {},
  info: (...params: LogParams) => {},
  warning: (...params: LogParams) => {},
  error: (...params: LogParams) => {},
};

export const defaultLogger = {
  ...DefaultLogger,
};
