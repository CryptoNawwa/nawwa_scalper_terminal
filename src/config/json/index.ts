import fs from 'fs';
import path from 'path';
import { APP_PATH } from '../../_common/const';
import { logger } from '../../logger';
import { TerminalError } from '../../_common/error';

export interface Json {
  [key: string]: string;
}

const JSONSyncErrorReason = {
  CANNOT_CREATE_FILE: 'CANNOT_CREATE_FILE',
  CANNOT_UPDATE_FILE: 'CANNOT_UPDATE_FILE',
};

export class JSONSync {
  readonly path: string;
  readonly name: string;

  private data: Json = {};

  constructor(name: string) {
    this.name = `${name}.json`;
    this.path = path.resolve(APP_PATH, this.name);
  }

  private create() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
    } catch (err) {
      logger.error(`Could not create file ${this.name} at ${this.path}`);
      throw new TerminalError(JSONSyncErrorReason.CANNOT_CREATE_FILE);
    }
  }

  public getData() {
    return this.data;
  }

  public new(newData: Json) {
    try {
      const data = JSON.parse(fs.readFileSync(this.path, 'utf8')) as Json;
      fs.writeFileSync(this.path, JSON.stringify({ ...data, ...newData }));

      this.data = { ...data, ...newData };
    } catch (err) {
      logger.error(`Cannot not update file ${this.name} with ${newData}`);
      throw new TerminalError(JSONSyncErrorReason.CANNOT_UPDATE_FILE);
    }
  }

  public load() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      if (!data) {
        logger.warn(`No ${this.name} file found, creating one..`);
        this.create();
      }

      this.data = JSON.parse(data) as Json;
      logger.success(`Data loaded from ${this.name}`);
    } catch (err) {
      logger.warn(`No ${this.name} file found, creating one..`);
      this.create();
    }
  }
}
