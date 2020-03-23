import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { Options, buildOptions } from './request';

export class DocumentAPI extends RESTDataSource {
  
  constructor() {
    super();
    this.baseURL = 'http://localhost:8080/nuxeo/api/v1';
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.token);
  }

  async getById(id: string, options: Options = {}) {
    return await this.get(`id/${id}`, undefined, buildOptions(options));
  }

  async getByPath(path: string, options: Options = {}) {
    return  await this.get(`path${path}`, undefined, buildOptions(options));
  }
}