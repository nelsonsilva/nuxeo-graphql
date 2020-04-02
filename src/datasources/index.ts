import { DataSources as GraphQLDataSources } from 'apollo-server-core/dist/graphqlOptions';
import { DocumentAPI } from './document';
import { SearchAPI } from './search';
import { AutomationAPI } from './automation';
import { TaskAPI } from './task';

export interface DataSources {
  document: DocumentAPI,
  search: SearchAPI,
  automation: AutomationAPI,
  task: TaskAPI,
}

export const dataSources = (): GraphQLDataSources<DataSources> => ({
  document: new DocumentAPI(),
  search: new SearchAPI(),
  automation: new AutomationAPI(),
  task: new TaskAPI(),
});
