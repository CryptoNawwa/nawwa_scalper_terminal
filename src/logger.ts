import chalk from 'chalk';
import { emoji } from 'node-emoji';

const logger = {
  error: (msg: string) => {
    console.log(chalk.red(`${emoji.x} ${msg}`));
  },
  nakedLog: (msg: string) => {
    console.log(chalk.blue(`${msg}`));
  },
  log: (msg: string) => {
    console.log(chalk.blue(`${emoji.arrow_right} ${msg}`));
  },
  infoLoading: (msg: string) => {
    console.log(chalk.blue(`${emoji.arrows_counterclockwise} ${msg}`));
  },
  info: (msg: string) => {
    console.log(chalk.blue(`${emoji.arrow_right} ${msg}`));
  },
  warn: (msg: string) => {
    console.log(chalk.yellow(`${emoji.warning} ${msg}`));
  },
  success: (msg: string) => {
    console.log(chalk.blue(`${emoji.white_check_mark} ${msg}`));
  },
  grey: (msg: string) => {
    console.log(chalk.grey(`${msg}`));
  },
  bold: (msg: string) => {
    console.log(chalk.bold(`${msg}`));
  },
};

export { logger };
