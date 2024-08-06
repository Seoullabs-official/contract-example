import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function symbol({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'symbol',
    version: '1',
    space: space,
    writer: writer,
  });

  let symbolHash = op.id_hash('symbol');
  let symbol = op.read_universal('collection', symbolHash);

  condition = op.ne(symbol, null);
  err_msg = 'Token symbol does not exist.';
  method.addExecution(op.condition(condition, err_msg));

  response = op.response(symbol);
  method.addExecution(response);

  return method;
}
