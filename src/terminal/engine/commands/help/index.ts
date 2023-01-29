import type { Engine } from '../../index';
import { logger } from '../../../../logger';
import { COMMAND_VALUES, isACommand } from '../const';
import chalk from 'chalk';

const printCommandNotFound = (cmd: string) => logger.log(`Command not found ${cmd.toLowerCase()}`);

const printSocials = () => logger.nakedLog(`${chalk.white('\nSocials:\n')}Discord: Nawwa#8129\nTwitter: @crypto_nawwa`);

export const help = async (args: string[], engine: Engine) => {
  const specificCommand = args[0];

  if (!specificCommand) {
    logger.log('Available commands:');
    Object.entries(COMMAND_VALUES).forEach(([key, value]) => {
      logger.bold(`\n${key.toLowerCase()}:`);
      if (typeof value.usage === 'string') {
        logger.nakedLog(`- ${value.usage}`);
      } else {
        value.usage.forEach(usage => {
          logger.nakedLog(`- ${usage}`);
        });
      }
    });
    printSocials();
    return true;
  }

  if (isACommand(specificCommand)) {
    const command = Object.entries(COMMAND_VALUES).find(([key, value]) => key === specificCommand);

    if (!command) {
      printCommandNotFound(specificCommand);
      return false;
    }

    const [, value] = command;

    if (typeof value.usage === 'string') {
      logger.nakedLog(`${chalk.underline('Usage:')}\n- ${value.usage}`);
    } else {
      logger.nakedLog(`${chalk.underline('Usages:')}\n- ${value.usage.join('\n- ')}`);
    }

    logger.nakedLog(chalk.underline(`\nExamples:`));
    if (typeof value.description === 'string') {
      logger.nakedLog(`- ${value.description}`);
    } else {
      logger.nakedLog(`- ${value.description.join('\n- ')}`);
    }
    return true;
  }

  printCommandNotFound(specificCommand);
  return false;
};
