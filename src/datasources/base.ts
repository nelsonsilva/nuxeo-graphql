import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';

export class NuxeoDataSource extends RESTDataSource {
  
  constructor(path = '') {
    super();
    this.baseURL = `http://localhost:8080/nuxeo/api/v1/${path}`;
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Cookie', this.context.cookie);
    request.headers.set('Authorization', this.context.token);
  }
}