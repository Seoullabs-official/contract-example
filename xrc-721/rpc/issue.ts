import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function issue({ writer, space }: NFTParams) {
  let condition, err_msg, update;
  let method = new SASEUL.SmartContract.Method({
    type: 'contract',
    name: 'Issue',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'name',
    type: 'string',
    maxlength: 80,
    requirements: true,
  });
  method.addParameter({
    name: 'symbol',
    type: 'string',
    maxlength: 20,
    requirements: true,
  });

  let from = op.load_param('from');
  let name = op.load_param('name');
  let symbol = op.load_param('symbol');

  // writer === from
  condition = op.eq(writer, from);
  err_msg = 'You are not the contract writer.';
  method.addExecution(op.condition(condition, err_msg));

  let nameHash = op.id_hash('name');
  let symbolHash = op.id_hash('symbol');
  let totalSupplyHash = op.id_hash('total_supply');

  // save info
  update = op.write_universal('collection', nameHash, name);
  method.addExecution(update);

  update = op.write_universal('collection', symbolHash, symbol);
  method.addExecution(update);

  update = op.write_universal('collection', totalSupplyHash, '0');
  method.addExecution(update);

  return method;
}
