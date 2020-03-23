import { DataSources as GraphQLDataSources } from 'apollo-server-core/dist/graphqlOptions';
import { DocumentAPI } from './document';
import { SearchAPI } from './search';

export interface DataSources {
  document: DocumentAPI,
  search: SearchAPI,
}

export const dataSources = (): GraphQLDataSources<DataSources> => ({
  document: new DocumentAPI(),
  search: new SearchAPI(),
});