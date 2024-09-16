import * as protobuf from 'protobufjs/minimal';
import { Any } from '@cosmjs/stargate';
import Long from 'long';  // Import Long.js

// Define the Ethermint `EthAccount` type manually
export const EthAccount = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.baseAccount !== undefined) {
      BaseAccount.encode(message.baseAccount, writer.uint32(10).fork()).ldelim();
    }
    if (message.codeHash !== '') {
      writer.uint32(18).string(message.codeHash);
    }
    return writer;
  },
  
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { baseAccount: undefined, codeHash: '' };

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseAccount = BaseAccount.decode(reader, reader.uint32());
          break;
        case 2:
          message.codeHash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

// Define the Cosmos `BaseAccount` type
export const BaseAccount = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.pubKey !== undefined) {
      Any.encode(message.pubKey, writer.uint32(18).fork()).ldelim();
    }
    if (message.accountNumber !== 0) {
      writer.uint32(24).uint64(message.accountNumber);
    }
    if (message.sequence !== 0) {
      writer.uint32(32).uint64(message.sequence);
    }
    return writer;
  },

  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { address: '', pubKey: undefined, accountNumber: 0, sequence: 0 };

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.pubKey = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.accountNumber = longToNumber(reader.uint64());  // Use longToNumber here
          break;
        case 4:
          message.sequence = longToNumber(reader.uint64());  // Use longToNumber here
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

// Helper function to convert long to number
function longToNumber(long) {
  if (Long.isLong(long)) {
    if (long.greaterThan(Long.MAX_SAFE_INTEGER)) {
      throw new Error("Value is larger than Number.MAX_SAFE_INTEGER");
    }
    return long.toNumber();
  }
  return long;  // Return as-is if it's not a Long object
}
