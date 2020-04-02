import { gql, makeExecutableSchema } from 'apollo-server-express';
import { readFileSync } from 'fs';
import resolvers from '../resolvers';
import schemaDirectives from '../directives';

const SCHEMA = './src/schema/schema.graphql';
const typeDefs = gql`${readFileSync(SCHEMA, 'utf8')}`;

export const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives,
  resolvers
});
