import { logger } from '../logger';

export class TerminalError extends Error {
  readonly variables?: Record<string, string | number>;

  constructor(message: string, variables?: Record<string, string | number>) {
    super(message);

    this.variables = variables;
    this.name = 'TerminalError';
  }
}

export const handleError = (err: unknown) => {
  if (err instanceof TerminalError) {
    logger.error(`Error : ${err.message}`);
    return;
  }
  console.log('Unhandled error');
  console.error(err);
};
