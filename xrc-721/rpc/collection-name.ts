import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function name({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'name',
    version: '1',
    space: space,
    writer: writer,
  });

  let nameHash = op.id_hash('name');
  let collectionName = op.read_universal('collection', nameHash);

  condition = op.ne(collectionName, null);
  err_msg = 'Collection name does not exist.';
  method.addExecution(op.condition(condition, err_msg));

  response = op.response(collectionName);
  method.addExecution(response);

  return method;
}
