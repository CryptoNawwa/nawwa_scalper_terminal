import type { Engine } from '../index';
import { connect } from './connect';
import { disconnect } from './disconnect/index';
import { help } from './help';
import { shortcut } from './shortcut';
import { switchActive } from './switch/index';
import { ticker } from './ticker';
import { atp } from './atp/index';
import { tp } from './tp';
import { scale } from './scale';
import { position } from './position/index';
import { cancel } from './cancel';
import chalk from 'chalk';

export const COMMAND_VALUES = {
  CONNECT: {
    name: 'CONNECT',
    usage: 'connect <bybit> or <binance>',
    description: `${chalk.italic("'connect binance'")} -> It will try to connect to binance`,
  },
  DISCONNECT: {
    name: 'DISCONNECT',
    usage: 'disconnect',
    description: `${chalk.italic("'disconnect'")} -> Will disconect from the current active exchange`,
  },
  HELP: {
    name: 'HELP',
    usage: ['help', 'help <command>'],
    description: [
      `${chalk.italic("'help'")} -> Will display help for all commands`,
      `${chalk.italic("'help atp'")} -> Will display help for the 'atp' command`,
    ],
  },
  SWITCH: {
    name: 'SWITCH',
    usage: 'switch <bybit | binance>',
    description: `${chalk.italic("'switch binance'")} -> Will switch the current active exchange to 'binance'`,
  },
  SHORTCUT: {
    name: 'SHORTCUT',
    usage: ['shortcut add <shortcut_name>=<shortcut_value>', 'shortcut list', 'shortcut load'],
    description: [
      `${chalk.italic("'shortcut add p=position'")} -> Will add the shortcut 'p' to the value 'position'`,
      `${chalk.italic("'shortcut load'")} -> Will reload the shortcut file`,
      `${chalk.italic("'shortcut list'")} -> Will list the available shortcuts`,
    ],
  },
  TICKER: {
    name: 'TICKER',
    usage: ['ticker <eth | btc | ...>', 'ticker clear'],
    description: [
      `${chalk.italic("'ticker eth'")} -> Will switch the active ticker to 'ETHUSDT'`,
      `${chalk.italic("'ticker clear'")} -> Will clear the current active ticker`,
    ],
  },
  ATP: {
    name: 'ATP',
    usage: ['atp <on> <shortcut_name>', 'atp <up | update> <shortcut_name>', 'atp <off>', 'atp <status | st>'],
    description: [
      `${chalk.italic("'atp on tp4'")} -> Will enable auto-take-profit with the 'tp4' shortcut`,
      `${chalk.italic("'atp up tp3'")} -> Will update auto-take-profit to use the 'tp3' shortcut`,
      `${chalk.italic("'atp off'")} -> Will disable auto-take-profit system`,
      `${chalk.italic("'atp up tp3'")} -> Will display auto-take-profit system status`,
    ],
  },
  TP: {
    name: 'TP',
    usage: 'tp <away_from_entry_%>',
    description: `${chalk.italic(
      "'tp 0.3'",
    )} -> Will create 1 reduce-only order on the active ticker, '0.3%' away from entry price`,
  },
  SCALE: {
    name: 'SCALE',
    usage: 'scale <nb_of_order> <from_%> <to_%>',
    description: [
      `${chalk.italic(
        "'scale 10 0.1 0.2'",
      )} -> Will create 10 reduce-only orders on the active ticker, from 0.1% to 0.2% away from the entry price`,
      `${chalk.italic(
        "'scale 2 0.5 0.8'",
      )} -> Will create 2 reduce-only orders on the active ticker, from 0.5% to 0.8% away from the entry price`,
    ],
  },
  POSITION: {
    name: 'POSITION',
    usage: ['position', 'position refresh'],
    description: [
      `${chalk.italic("'position'")} -> Will list current opened position for the active exchange`,
      `${chalk.italic("'position refresh'")} -> Will call the exchange and force-refresh current positions`,
    ],
  },
  CANCEL: {
    name: 'CANCEL',
    usage: 'cancel',
    description: `${chalk.italic("'cancel'")} -> Will cancel all the recent limit-order placed for the active ticker`,
  },
};

export type COMMANDS = keyof typeof COMMAND_VALUES;
export const isACommand = (value: string): value is COMMANDS => {
  return Object.keys(COMMAND_VALUES).includes(value);
};

type CommandFunction = (args: string[], engine: Engine) => Promise<boolean>;
export const MAP_USER_INPUT_TO_COMMAND: Record<COMMANDS, CommandFunction> = {
  CONNECT: connect,
  DISCONNECT: disconnect,
  HELP: help,
  SWITCH: switchActive,
  SHORTCUT: shortcut,
  TICKER: ticker,
  CANCEL: cancel,
  ATP: atp,
  TP: tp,
  SCALE: scale,
  POSITION: position,
};
