import { ScalperError } from './error';

export const requireString = (str: string | undefined | null, label: string) => {
  if (!str) {
    throw new ScalperError(`environement variable missing ${label}`);
  }

  return str;
};
