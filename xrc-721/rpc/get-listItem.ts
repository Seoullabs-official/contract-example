import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function listItem({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'ListItem',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'page',
    type: 'int',
    maxlength: 5,
    requirements: true,
  });
  method.addParameter({
    name: 'count',
    type: 'int',
    maxlength: 4,
    requirements: true,
  });
  method.addParameter({
    name: 'address',
    type: 'string',
    maxlength: SASEUL.Enc.ID_HASH_SIZE,
    requirements: true,
  });
  let address = op.load_param('address');
  let page = op.load_param('page');
  let count = op.load_param('count');
  let inventory = op.concat(['inventory_', address]);

  // return list
  let list = op.list_universal(inventory, page, count);

  response = op.response(list);
  method.addExecution(response);

  return method;
}
