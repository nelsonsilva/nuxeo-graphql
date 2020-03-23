import { PubSub } from 'graphql-subscriptions';

export const EVENTS = {
  DOCUMENT_CREATED: 'documentCreated',
  DOCUMENT_MODIFIED: 'documentModified',
  DOCUMENT_TRASHED: 'documentTrashed'
}

const pubsub = new PubSub();

export const subscribe = (...events: string[]) => pubsub.asyncIterator(events);

export const publish = (event: string, payload: any) => pubsub.publish(event, {[event]: payload});
