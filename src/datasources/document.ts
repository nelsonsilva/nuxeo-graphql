import { NuxeoDataSource } from './base';
import { Options, buildOptions } from './request';

export class DocumentAPI extends NuxeoDataSource {
  
  constructor() {
    super();
  }

  async getById(id: string, options: Options = {}) {
    return await this.get(`id/${id}`, undefined, buildOptions(options));
  }

  async getByPath(path: string, options: Options = {}) {
    return  await this.get(`path${path}`, undefined, buildOptions(options));
  }
}