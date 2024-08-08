const SASEUL = require('saseul');

import { NFTParams } from '../interface/IContract';

let op = SASEUL.SmartContract.Operator;

function issue({ writer, space }: NFTParams) {
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

function mint({ writer, space }: NFTParams) {
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
    type: 'int',
    maxlength: 11,
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
  method.addParameter({
    name: 'attribute',
    type: 'any',
    requirements: false,
  });
  let from = op.load_param('from');
  let tokenId = op.load_param('tokenId');
  let name = op.load_param('name');
  let description = op.load_param('description');
  let image = op.load_param('image');
  let attribute = op.load_param('attribute');

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

  update = op.write_universal('metadata', tokenHash, attribute);
  method.addExecution(update);

  return method;
}

function tokenURI({ writer, space }: NFTParams) {
  let condition, err_msg, update, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'TokenURI',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'tokenId',
    type: 'int',
    maxlength: 11,
    requirements: true,
  });

  let tokenId = op.load_param('tokenId');
  let tokenHash = op.id_hash(tokenId);
  let metadata = op.read_universal('metadata', tokenHash, null);

  condition = op.eq(metadata, null);
  err_msg = 'The tokenURI for this tokenId does not exist.';
  method.addExecution(op.condition(condition, err_msg));

  response = op.response({
    metadata,
  });

  method.addExecution(response);

  return method;
}
function ownerOf({ writer, space }: NFTParams) {
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
    type: 'int',
    maxlength: 11,
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

function listItem({ writer, space }: NFTParams) {
  let condition, err_msg, response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'ListTokenOf',
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

function balanceOf({ writer, space }: NFTParams) {
  let response;
  let method = new SASEUL.SmartContract.Method({
    type: 'request',
    name: 'BalanceOf',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'address',
    type: 'string',
    maxlength: SASEUL.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  let address = op.load_param('address');
  let balance = op.read_universal('balance', address, '0');

  // return balance
  response = op.response({ balance });
  method.addExecution(response);

  return method;
}

function getInfo({ writer, space }: NFTParams) {
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
    type: 'int',
    maxlength: 11,
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

function transfer({ writer, space }: NFTParams) {
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
    type: 'int',
    maxlength: 11,
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

function totalSupply({ writer, space }: NFTParams) {
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

function name({ writer, space }: NFTParams) {
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

function symbol({ writer, space }: NFTParams) {
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

export = {
  issue,
  mint,
  transfer,
  name,
  symbol,
  totalSupply,
  getInfo,
  balanceOf,
  listItem,
  ownerOf,
  tokenURI,
};
