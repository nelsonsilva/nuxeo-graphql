import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo, simplifyParsedResolveInfoFragmentWithType, ResolveTree } from 'graphql-parse-resolve-info';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { DataSources } from './datasources';
import { subscribe, EVENTS } from './pubsub';

interface Context {
  dataSources: DataSources
}

const ENRICHER_FIELDS: any = {
  isFavorite: 'favorites'
}

const ENRICHERS = {
  audit: (doc: any) => doc.contextParameters.audit.entries,
  breadcrumb: (doc: any) => doc.contextParameters.breadcrumb.entries,
  collections: (doc: any) => doc.contextParameters.collections.entries,
  firstAccessibleAncestor: (doc: any) => doc.contextParameters.firstAccessibleAncestor,
  hasContent: (doc: any) => doc.contextParameters.hasContent,
  pendingTasks: (doc: any) => doc.contextParameters.pendingTasks.entries,
  permissions: (doc: any) => doc.contextParameters.permissions,
  renditions: (doc: any) => doc.contextParameters.renditions,
  runnableWorkflows: (doc: any) => doc.contextParameters.runnableWorkflows,
  runningWorkflows: (doc: any) => doc.contextParameters.runningWorkflows,
  subscribedNotifications: (doc: any) => doc.contextParameters.subscribedNotifications,
  subtypes: (doc: any) => doc.contextParameters.subtypes.map((t: any) => t.type),
  tags: (doc: any) => doc.contextParameters.tags,
  thumbnail: (doc: any) => doc.contextParameters.thumbnail.url,
};

function getEnrichers(resolveInfo: GraphQLResolveInfo) : {document: string[]} {
  const info = parseResolveInfo(resolveInfo) as ResolveTree;
  const fields: any = simplifyParsedResolveInfoFragmentWithType(info, resolveInfo.returnType).fields;
  
  // legacy behavior
  if (fields.contextParameters) {
    return fields.contextParameters.args.enrichers;
  }

  if (fields.entries) {
    const docFields = fields.entries.fieldsByTypeName.Document;
    if (docFields.contextParameters) {
      return docFields.contextParameters.args && docFields.contextParameters.args.enrichers;
    }
  }

  return {document: [...new Set(Object.keys(fields).map(k => {
    if (ENRICHERS.hasOwnProperty(k)) {
      return k;
    } else if (ENRICHER_FIELDS.hasOwnProperty(k)) {
      return ENRICHER_FIELDS[k];
    }
  }).filter(Boolean))]};
}

export default {
  Query: {
    document: async (_ : null, { id, path }: { id: string, path: string }, { dataSources: { document }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await id ? document.getById(id, { enrichers }) : document.getByPath(path, { enrichers });
    },
    search: async (_ : null, { provider, query, params, queryParams, pagination }: { provider: string, query: string, params: any, queryParams: [string], pagination: any }, { dataSources: { search }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      if (query) {
        return await search.nxql(query, {  ...params, ...pagination }, { enrichers });
      }
      return await search.search(provider, { ...queryParams && { queryParams }, ...params, ...pagination }, { enrichers });
    },
    nxql: async (_ : null, { nxql, pagination }: { nxql: string, pagination: any }, { dataSources: { search }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await search.nxql(nxql, {  ...pagination }, { enrichers });
    },
    tasks: async (_ : null, { params, pagination }: { params: any, pagination: any }, { dataSources: { task }} : Context, resolveInfo: GraphQLResolveInfo) => {
      return await task.tasks({ ...params, ...pagination }, {fetchers: {task: ['targetDocumentIds', 'actors']}});
    },
    notes: async (_: null, args: null, { dataSources: { search }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await search.nxql('SELECT * FROM Note WHERE ecm:mixinType != "HiddenInNavigation" AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0', undefined, { enrichers });
    },
  },
  // JSON
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  // Document
  Document: {
    ...ENRICHERS,
    isFavorite: (doc: any) => doc.contextParameters.favorites.isFavorite,

    properties: (doc: any, { schemas } : { schemas: [string]}) =>  doc.properties,
    contextParameters: (doc: any, { enrichers } : { enrichers: [string]})=> doc.contextParameters,
  },
  // Union type
  Pageable: {
    __resolveType: (obj: any) => obj['entity-type'][0].toUpperCase() + obj['entity-type'].slice(1),
  },
  Note: {
    tags: ENRICHERS.tags,
    thumbnail: ENRICHERS.thumbnail,
    isFavorite: (doc: any) => doc.contextParameters.favorites.isFavorite,
  },
  AuditEvent: {
    document: async (parent: any, args: any, { dataSources: { document }}: Context) => {
      return await document.getById(parent.docId);
    }
  },
  Subscription: {
    documentCreated: {
      subscribe: () => subscribe(EVENTS.DOCUMENT_CREATED)
    },
    documentModified: {
      subscribe: () => subscribe(EVENTS.DOCUMENT_MODIFIED)
    },
    documentTrashed: {
      subscribe: () => subscribe(EVENTS.DOCUMENT_TRASHED)
    }
    /*
    // generate a subscription for each event
    ...Object.values(EVENTS).map(e => ({
      subscribe: () => subscribe(e)
    }))
    */
  }
};
