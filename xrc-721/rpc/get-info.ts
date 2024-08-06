import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function getInfo({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'GetInfo',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'tokenId',
    type: 'string',
    maxlength: 16,
    requirements: true,
  });
  method.addParameter({
    name: 'address',
    type: 'string',
    maxlength: SASEUL.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  let tokenId = op.load_param('tokenId');
  let tokenHash = op.id_hash(tokenId);

  let owner = op.read_universal('owner', tokenHash);
  let address = op.load_param('address');

  condition = op.ne(owner, null);
  err_msg = 'owner null.';
  method.addExecution(op.condition(condition, err_msg));

  condition = op.eq(owner, address);
  err_msg = 'address you entered is not owned by the owner.';
  method.addExecution(op.condition(condition, err_msg));

  // return list
  let inventory = op.read_universal(
    op.concat(['inventory_', address]),
    tokenHash
  );

  response = op.response({
    tokenId: tokenId,
    owner: owner,
    info: inventory,
  });
  method.addExecution(response);

  return method;
}
