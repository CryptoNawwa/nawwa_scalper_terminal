import { COMMAND_VALUES } from '../engine/commands/const';

export const autocomplete = (input: string) => {
  if (!input || typeof input != 'string') return [[], input];

  const found = Object.keys(COMMAND_VALUES)
    .filter(cmd => {
      return cmd.startsWith(input.toLocaleUpperCase());
    })
    .map(cmd => cmd.toLocaleLowerCase());

  return [found.length ? found : [], input];
};
