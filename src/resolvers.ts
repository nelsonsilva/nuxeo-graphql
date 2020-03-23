import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo, simplifyParsedResolveInfoFragmentWithType, ResolveTree } from 'graphql-parse-resolve-info';
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

function getEnrichers(resolveInfo: GraphQLResolveInfo) {
  const info = parseResolveInfo(resolveInfo) as ResolveTree;
  const { fields } = simplifyParsedResolveInfoFragmentWithType(info, resolveInfo.returnType);
  // console.debug('info', info.fieldsByTypeName);
  return [...new Set(Object.keys(fields).map(k => {
    if (ENRICHERS.hasOwnProperty(k)) {
      return k;
    } else if (ENRICHER_FIELDS.hasOwnProperty(k)) {
      return ENRICHER_FIELDS[k];
    }
  }).filter(Boolean))];
}

export default {
  Query: {
    document: async (_ : null, { id, path }: { id: string, path: string }, { dataSources: { document }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await id ? document.getById(id, { enrichers }) : document.getByPath(path, { enrichers });
    },
    documents: async (_ : null, { nxql }: { nxql: string}, { dataSources: { search }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await search.nxql(nxql, undefined, { enrichers });
    },
    notes: async (_: null, args: null, { dataSources: { search }} : Context, resolveInfo: GraphQLResolveInfo) => {
      const enrichers = getEnrichers(resolveInfo);
      return await search.nxql('SELECT * FROM Note WHERE ecm:mixinType != "HiddenInNavigation" AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0', undefined, { enrichers });
    },
  },
  Document: {
    ...ENRICHERS,
    isFavorite: (doc: any) => doc.contextParameters.favorites.isFavorite,
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
