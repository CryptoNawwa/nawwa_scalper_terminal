import type { ExchangeSuccess, ExchangeError, ExchangeResult } from '../interface/index';

export const ok = <T>(data: T): ExchangeSuccess<T> => {
  return {
    type: 'success',
    data,
  };
};

export const refuse = (message: string): ExchangeError => {
  return {
    type: 'error',
    message,
  };
};

export const isOk = <T>(result: ExchangeResult<T>): result is ExchangeSuccess<T> => {
  return result.type === 'success';
};

export const isRefusal = <T>(result: ExchangeResult<T>): result is ExchangeError => {
  return result.type === 'error';
};
