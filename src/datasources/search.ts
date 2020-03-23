import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { Options, buildOptions } from './request';

export interface SearchParams {
  currentPageIndex?: Number,
  offset?: Number,
  pageSize?: Number
}

export class SearchAPI extends RESTDataSource {
  
  constructor() {
    super();
    this.baseURL = 'http://localhost:8080/nuxeo/api/v1/search';
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.token);
    request.headers.set('properties', '*');
  }

  async nxql(nxql: string, params: SearchParams = {}, options: Options = {}) {
    const res = await this.get(
      `pp/nxql_search/execute`,
      {
        ...params,
        queryParams: nxql
      },
      buildOptions(options)
    );
    return res.entries;
  }
}