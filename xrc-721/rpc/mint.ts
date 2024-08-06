import { NFTParams } from '../interface/IContract';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;

export function mint({ writer, space }: NFTParams): any {
  let condition, err_msg, update;
  let method = new SASEUL.SmartContract.Method({
    type: 'contract',
    name: 'Mint',
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
    name: 'name',
    type: 'string',
    maxlength: 80,
    requirements: true,
  });
  method.addParameter({
    name: 'description',
    type: 'string',
    maxlength: 2000,
    requirements: false,
  });
  method.addParameter({
    name: 'image',
    type: 'any',
    maxlength: 1048576,
    requirements: true,
  });

  let from = op.load_param('from');
  let tokenId = op.load_param('tokenId');
  let name = op.load_param('name');
  let description = op.load_param('description');
  let image = op.load_param('image');

  let tokenHash = op.id_hash(tokenId);

  let totalSupplyHash = op.id_hash('total_supply');
  let already_tokenId = op.read_universal(
    op.concat(['inventory_', from]),
    tokenHash,
    null
  );

  // already_tokenId == null
  condition = op.eq(already_tokenId, null);
  err_msg = 'this token ID already exists.';
  method.addExecution(op.condition(condition, err_msg));

  let total_supply = op.read_universal('collection', totalSupplyHash, '0');
  update = op.write_universal(
    'collection',
    totalSupplyHash,
    op.add([total_supply, '1'])
  ); // defatul : 1
  method.addExecution(update);

  // balance
  let balance = op.read_universal('balance', from, '0');
  update = op.write_universal('balance', from, op.add([balance, '1']));
  method.addExecution(update);

  // save owner
  update = op.write_universal('owner', tokenHash, from);
  method.addExecution(update);

  update = op.write_universal(op.concat(['inventory_', from]), tokenHash, {
    tokenId: tokenId,
    name: name,
    description: description,
    image: image,
  });
  method.addExecution(update);

  return method;
}
