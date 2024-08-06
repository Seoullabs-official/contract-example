import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function transfer({ writer, space }: NFTParams): any {
  let condition, err_msg, update;
  let method = new SASEUL.SmartContract.Method({
    type: 'contract',
    name: 'Transfer', // transfer
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'to',
    type: 'string',
    maxlength: SASEUL.Enc.ID_HASH_SIZE,
    requirements: true,
  });
  method.addParameter({
    name: 'tokenId',
    type: 'string',
    maxlength: 16,
    requirements: true,
  });

  let from = op.load_param('from');
  let to = op.load_param('to');
  let tokenId = op.load_param('tokenId');
  let tokenHash = op.id_hash(tokenId);

  let from_balance = op.read_universal('balance', from, '0');
  let to_balance = op.read_universal('balance', to, '0');

  let owner = op.read_universal('owner', tokenHash);

  let inventory_to = op.concat(['inventory_', to]);

  let inventory_from = op.concat(['inventory_', from]);
  let inventoryInfoOfFrom = op.read_universal(inventory_from, tokenHash);

  // from !== to
  condition = op.ne(from, to);
  err_msg = "You can't send to yourself.";
  method.addExecution(op.condition(condition, err_msg));

  // from === owner
  condition = op.eq(from, owner);
  err_msg = 'You are not the owner of the token.';
  method.addExecution(op.condition(condition, err_msg));

  // inventoryInfoOfFrom !== null
  condition = op.ne(inventoryInfoOfFrom, null);
  err_msg = 'the token ID does not exist in the address.';
  method.addExecution(op.condition(condition, err_msg));

  // from_balance >= 1
  condition = op.gte(from_balance, '1');
  err_msg = "You can't send more than what you have.";
  method.addExecution(op.condition(condition, err_msg));

  // owner = to;
  update = op.write_universal('owner', tokenHash, to);
  method.addExecution(update);

  // from_balance = from_balance - amount;
  from_balance = op.sub([from_balance, '1']);
  update = op.write_universal('balance', from, from_balance);
  method.addExecution(update);

  // to_balance = to_balance + amount;
  to_balance = op.add([to_balance, '1']);
  update = op.write_universal('balance', to, to_balance);
  method.addExecution(update);

  // inventory: from = {}
  update = op.write_universal(inventory_from, tokenHash, {});
  method.addExecution(update);

  // inventory: to = token info
  update = op.write_universal(inventory_to, tokenHash, inventoryInfoOfFrom);
  method.addExecution(update);

  return method;
}
