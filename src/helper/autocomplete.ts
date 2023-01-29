import { COMMAND_VALUES } from '../terminal/engine/commands/const';

export const autocomplete = (input: string) => {
  if (!input || typeof input != 'string') return [[], input];

  const found = Object.keys(COMMAND_VALUES)
    .filter(cmd => {
      return cmd.toUpperCase().startsWith(input.toUpperCase());
    })
    .map(cmd => cmd.toLowerCase());

  return [found.length ? found : [], input];
};
