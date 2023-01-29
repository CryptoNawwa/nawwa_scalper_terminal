import { emoji } from 'node-emoji';
import * as Readline from 'node:readline';
import { logger } from './logger';
import { autocomplete } from './helper/autocomplete';
import { Engine, ENGINE_RETURN } from './terminal';
import { printFiglet } from './helper/printFiglet';
import chalk from 'chalk';

const engine = new Engine();
const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  completer: autocomplete,
});

(async () => {
  printFiglet();
  console.log(chalk.white(`${emoji.money_with_wings} Happy scalping ${emoji.money_with_wings}`));
  await engine.initialize();

  const quit = async () => {
    logger.nakedLog(`\nGoodbye ${emoji.wave} ${emoji.wave} !`);
    await engine.shutdown();
    process.exit(0);
  };

  readline.setPrompt(engine.getPromptTextFormatted());
  readline.prompt(true);
  readline
    .on('line', async line => {
      const result = await engine.runCommand(line);

      if (result === ENGINE_RETURN.EXIT) {
        return readline.close();
      }

      readline.setPrompt(engine.getPromptTextFormatted());
      readline.prompt(true);
    })
    .on('close', quit)
    .on('SIGINT', quit);
})();
