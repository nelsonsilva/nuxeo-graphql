import { SchemaDirectiveVisitor } from 'graphql-tools';
import { GraphQLField, defaultFieldResolver } from 'graphql';

class AliasDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { to } = this.args;
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (object, args, context, info) => {
      object[field.name] = object.properties[to];
      return resolve.call(this, object, args, context, info);
    };
  }
}

class EnricherDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    // (field as any).enricher = this.args.name;
    field.resolve = async (object, args, context, info) => {
      // object[field.name] = object.contextParameters.favorites object.properties[to];
      return resolve.call(this, object, args, context, info);
    };
  }
}

export default {
  alias: AliasDirective,
  // enricher: EnricherDirective
};
