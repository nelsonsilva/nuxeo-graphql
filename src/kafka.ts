import { KafkaClient, Consumer, Message } from 'kafka-node';
import TYPES from './avro';

export function consume(topic: string, cb: (message: any) => void) {
  const client = new KafkaClient({kafkaHost: 'kafka:9092'});
  const consumer = new Consumer(client, [{ topic }], {encoding: 'buffer'});
  consumer.on('error', console.error);
  consumer.on('message', (message: Message) => {
    // Single-object encoding
    // 10 byte header:
    //  2 byte marker (C3 01)
    //  8-byte little-endian schema fingerprint
    const buffer = message.value as Buffer;
    const fingerprint = buffer.slice(2, 10).reverse().toString('hex');
    const type = TYPES[fingerprint];
    const record = type.fromBuffer(buffer.slice(10));
    cb(record);
  });
}