import { NuxeoDataSource } from './base';
import { Options, buildOptions } from './request';

export class AutomationAPI extends NuxeoDataSource {
  
  constructor() {
    super('automation');
  }

  async call(op: string, params?: any, options: Options = {}) {
    return await this.post(op, params, buildOptions(options));
  }
}