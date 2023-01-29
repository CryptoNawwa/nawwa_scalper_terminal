import chalk from 'chalk';
import { logger } from '../../../../../logger';
import type { Engine } from '../../../../../terminal/engine';
import { ATPType } from '../../../../../terminal/engine/types';
import { TerminalError } from '../../../../../_common/error';
import { COMMAND_VALUES } from '../../const';

const printUsage = () => logger.error(`Usage: ${COMMAND_VALUES.ATP.usage[0]}`);
const WRONG_ARGUMENT_MSG = "Wrong argument for 'atp on' command";

const ATPOnErrorReason = {
  SCALE_COMAND_HAS_INVALID_ARGS: 'SCALE_COMAND_HAS_INVALID_ARGS',
  TP_COMAND_HAS_INVALID_ARGS: 'TP_COMAND_HAS_INVALID_ARGS',
};

const parseScaleCommandArgs = (possibleScale: string) => {
  const [, numberOfOrder, from, to] = possibleScale.split(' ');

  if (!numberOfOrder || !from || !to) {
    logger.error(`Problem in ATP command, shorcut '${possibleScale}' has a wrong syntax.`);
    throw new TerminalError(ATPOnErrorReason.SCALE_COMAND_HAS_INVALID_ARGS);
  }

  return {
    numberOfOrders: parseInt(numberOfOrder),
    from: parseFloat(from),
    to: parseFloat(to),
  };
};

const parseTpCommandArgs = (possibleTp: string) => {
  const [, awayFromPrice] = possibleTp.split(' ');

  if (!awayFromPrice) {
    logger.error(`Problem in ATP command, shorcut '${possibleTp}' has a wrong syntax.`);
    throw new TerminalError(ATPOnErrorReason.TP_COMAND_HAS_INVALID_ARGS);
  }

  return {
    awayFromEntry: parseFloat(awayFromPrice),
  };
};

export const on = (args: string[], engine: Engine) => {
  if (args[1] === undefined) {
    logger.error(WRONG_ARGUMENT_MSG);
    printUsage();
    return false;
  }

  const atpShortcut = args[1].toLowerCase();
  const cancelOption = args[2] ? (args[2].toUpperCase() === 'CANCEL_OFF' ? true : false) : false;

  const shortcutFound = Object.entries(engine.shortcuts.getData()).find(([key]) => key.toLowerCase() === atpShortcut);
  if (!shortcutFound) {
    logger.error(`Shortcut ${atpShortcut} not found in the ${engine.shortcuts.name} file.`);
    return false;
  }

  const [, shortcutValue] = shortcutFound;
  const [shortcutCommand] = shortcutValue.toUpperCase().split(' ');

  const exchange = engine.getCurrentActiveExchange();
  if (!exchange) {
    logger.error(`No active exchange.`);
    return false;
  }

  switch (shortcutCommand) {
    case 'SCALE':
      const scaleArgs = parseScaleCommandArgs(shortcutValue);
      exchange.autoTakeProfit = {
        shortcut: shortcutValue,
        cancel: cancelOption,
        type: ATPType.SCALE,
        ...scaleArgs,
      };
      break;
    case 'TP':
      const tpArgs = parseTpCommandArgs(shortcutValue);
      exchange.autoTakeProfit = {
        shortcut: shortcutValue,
        type: ATPType.TP,
        cancel: cancelOption,
        ...tpArgs,
      };
      break;
    default:
      logger.error(`Shortcut value '${shortcutValue}' is not allowed for the 'atp' command.`);
      return false;
  }

  engine.promptTextTemplate.atpActive = {
    shortcutName: atpShortcut,
  };

  logger.info(`AutoTakeProfit system is [${chalk.green('ON')}].`);
  logger.success(`AutoTakeProfit system is now using the '${chalk.bold(atpShortcut)}' shortcut.`);
  return true;
};
