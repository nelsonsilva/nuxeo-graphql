import { NuxeoDataSource } from './base';
import { Options, buildOptions } from './request';

export interface SearchParams {
  currentPageIndex?: number,
  offset?: number,
  pageSize?: number,
  queryParams?: [string]
}

export class SearchAPI extends NuxeoDataSource {
  
  constructor() {
    super('search');
  }

  async search(provider: string, params: SearchParams = {}, options: Options = {}) {
    return await this.get(
      `pp/${provider}/execute`,
      { ...params },
      buildOptions(options)
    );
  }
  
  async nxql(nxql: string, params: SearchParams = {}, options: Options = {}) {
    return await this.search('nxql_search',{ ...params, queryParams: [nxql] }, options);
  }
}