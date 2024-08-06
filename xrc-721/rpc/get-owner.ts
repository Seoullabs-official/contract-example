import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function ownerOf({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'OwnerOf',
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

  let tokenId = op.load_param('tokenId');
  let tokenHash = op.id_hash(tokenId);
  let owner = op.read_universal('owner', tokenHash);

  // owner !== null
  condition = op.ne(owner, null);
  err_msg = 'The token does not exist.';
  method.addExecution(op.condition(condition, err_msg));

  // return owner
  response = op.response({
    owner,
  });

  method.addExecution(response);

  return method;
}
