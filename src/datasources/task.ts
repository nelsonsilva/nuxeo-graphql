import { NuxeoDataSource } from './base';
import { Options, buildOptions } from './request';

export class TaskAPI extends NuxeoDataSource {
  
  constructor() {
    super('task');
  }

  async tasks(params: any, options: Options = {}) {
    return await this.get('', params, buildOptions(options));
  }

}