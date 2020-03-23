import { types, Type } from 'avsc';
import { readdirSync, readFileSync } from 'fs';
import { basename } from 'path';
import Long from 'long';

// https://github.com/mtth/avsc/wiki/Advanced-usage#custom-long-types
export const longType = types.LongType.__with({
  fromBuffer: (buf: Buffer) => {
    return new Long(buf.readInt32LE(0), buf.readInt32LE(4));
  },
  toBuffer: (n: Long) => {
    const buf = Buffer.alloc(8);
    buf.writeInt32LE(n.getLowBits(), 0);
    buf.writeInt32LE(n.getHighBits(), 4);
    return buf;
  },
  fromJSON: Long.fromValue,
  toJSON: (n: Long) => +n,
  isValid: Long.isLong,
  compare: (n1: Long, n2: Long) => n1.compare(n2)
});

// map of types with hex schema fingerprint as key
const TYPES: { [name: string]: Type } = {};
const AVSC_FOLDER = 'data/nuxeo/data/avro';

readdirSync(AVSC_FOLDER).forEach(f => {
  // <name>-0x<fingerprint>.avsc
  const [name, hex] = basename(f, '.avsc').split('-');
  let fingerprint = hex.substring(2).toLowerCase();
  
  // ¯\_(ツ)_/¯ avoid Error: invalid name: "org.nuxeo.ecm.core.bulk.message.BulkStatus$.State" 
  if (name === 'BulkStatus') return; 
  
  let schema = JSON.parse(readFileSync(`${AVSC_FOLDER}/${f}`, {encoding: 'utf8'}));
  TYPES[fingerprint] = Type.forSchema(schema, { registry: { long: longType } });
});

export default TYPES;