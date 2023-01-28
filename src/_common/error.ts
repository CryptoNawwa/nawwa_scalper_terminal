import { logger } from '../logger';

export class ScalperError extends Error {
  readonly variables?: Record<string, string | number>;

  constructor(message: string, variables?: Record<string, string | number>) {
    super(message);

    this.variables = variables;
    this.name = 'ScalperError';
  }
}

export const handleError = (err: unknown) => {
  if (err instanceof ScalperError) {
    logger.error(`Error : ${err.message}`);
    return;
  }
  console.log('Unhandled error');
  console.error(err);
};
