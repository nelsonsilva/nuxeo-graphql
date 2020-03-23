import http from 'http';
import express from 'express';
import { gql, ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { dataSources } from './datasources';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import { consume } from './kafka';
import { publish, EVENTS } from './pubsub';

const SCHEMA = './src/schema/schema.graphql';
const typeDefs = gql`${readFileSync(SCHEMA, 'utf8')}`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  schemaDirectives,
  playground: false,
  tracing: true,
  context: async (ctx: any) => {
    // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#context-with-subscriptions
    if (ctx.connection) {
      const context = ctx.connection.context;
      // XXX dataSource not available in the connection context
      // https://github.com/apollographql/apollo-server/issues/1526
      const sources = dataSources();
      Object.values(sources).forEach(dataSource => dataSource.initialize && dataSource.initialize({ context, cache: undefined } as any));

      // check connection for metadata
      return {
        dataSources: sources,
        token: ctx.token,
        ...context
      };
    } else {
      // check from req
      const token = ctx.req.headers.authorization || '';
      return { token };
    }
  },
  subscriptions: {
    onConnect: async (connectionParams: any, webSocket, context: any) => {
      const token = connectionParams.Authorization;
      return { token };
    }
   }
 });

const app = express();
app.use(express.static('public'))

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

consume('nuxeo-audit', (record) => {
  const entry = JSON.parse(record.data.toString('utf8'));
  const evt =  {
    source: 'audit',
    name: entry.eventId,
    category: entry.category,
    docId: entry.docUUID,
    repository: entry.repositoryId,
    principalName: entry.principalName,
    docLifeCycle: entry.docLifeCycle,
    docType: entry.docType,
    docPath: entry.docPath,
    comment: entry.comment,
    eventDate: entry.eventDate,
    logDate: entry.logDate,
    eventId: entry.id
  };
  // publish AuditEvent
  if (Object.values(EVENTS).includes(evt.name)) {
    publish(evt.name, evt);
  }
});

const port = 4000;
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});