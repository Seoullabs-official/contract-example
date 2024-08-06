import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function totalSupply({ writer, space }: NFTParams) {
  let response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'totalSupply',
    version: '1',
    space: space,
    writer: writer,
  });

  let totalSupplyHash = op.id_hash('total_supply');
  let total_supply = op.read_universal('collection', totalSupplyHash, '0');

  response = op.response({ total_supply });
  method.addExecution(response);

  return method;
}
