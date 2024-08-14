import XPHERE from 'xphere';

import { NFTParams } from '../types/contractType';

const op = XPHERE.SmartContract.Operator;

function issue(data: NFTParams) {
  const { writer, space } = data;
  let update;

  const method = new XPHERE.SmartContract.Method({
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

  const from = op.load_param('from');
  const name = op.load_param('name');
  const symbol = op.load_param('symbol');

  // writer === from
  const condition = op.eq(writer, from);
  const errMsg = 'You are not the contract writer.';
  method.addExecution(op.condition(condition, errMsg));

  const nameHash = op.id_hash('name');
  const symbolHash = op.id_hash('symbol');
  const totalSupplyHash = op.id_hash('totalSupply');

  // save info
  update = op.write_universal('collection', nameHash, name);
  method.addExecution(update);

  update = op.write_universal('collection', symbolHash, symbol);
  method.addExecution(update);

  update = op.write_universal('collection', totalSupplyHash, '0');
  method.addExecution(update);

  return method;
}

function mint(data: NFTParams) {
  const { writer, space } = data;
  let update;

  const method = new XPHERE.SmartContract.Method({
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

  const from = op.load_param('from');
  const tokenId = op.load_param('tokenId');
  const name = op.load_param('name');
  const description = op.load_param('description');
  const image = op.load_param('image');
  const attribute = op.load_param('attribute');

  const tokenHash = op.id_hash(tokenId);

  const totalSupplyHash = op.id_hash('totalSupply');
  const alreadyTokenId = op.read_universal(
    op.concat(['inventory_', from]),
    tokenHash,
    null
  );

  // alreadyTokenId == null
  const condition = op.eq(alreadyTokenId, null);
  const errMsg = 'this token ID already exists.';
  method.addExecution(op.condition(condition, errMsg));

  const totalSupply = op.read_universal('collection', totalSupplyHash, '0');
  update = op.write_universal(
    'collection',
    totalSupplyHash,
    op.add([totalSupply, '1'])
  ); // defatul : 1
  method.addExecution(update);

  // balance
  const balance = op.read_universal('balance', from, '0');
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

function tokenURI(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
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

  const tokenId = op.load_param('tokenId');
  const tokenHash = op.id_hash(tokenId);
  const metadata = op.read_universal('metadata', tokenHash, null);

  const condition = op.eq(metadata, null);
  const errMsg = 'The tokenURI for this tokenId does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response({
    metadata,
  });

  method.addExecution(response);

  return method;
}

function ownerOf(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
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

  const tokenId = op.load_param('tokenId');
  const tokenHash = op.id_hash(tokenId);
  const owner = op.read_universal('owner', tokenHash);

  // owner !== null
  const condition = op.ne(owner, null);
  const errMsg = 'The token does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  // return owner
  const response = op.response({
    owner,
  });

  method.addExecution(response);

  return method;
}

function listItem(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
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
    maxlength: XPHERE.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  const address = op.load_param('address');
  const page = op.load_param('page');
  const count = op.load_param('count');
  const inventory = op.concat(['inventory_', address]);

  // return list
  const list = op.list_universal(inventory, page, count);

  const response = op.response(list);
  method.addExecution(response);

  return method;
}

function balanceOf(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'BalanceOf',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'address',
    type: 'string',
    maxlength: XPHERE.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  const address = op.load_param('address');
  const balance = op.read_universal('balance', address, '0');

  // return balance
  const response = op.response({ balance });
  method.addExecution(response);

  return method;
}

function getInfo(data: NFTParams) {
  const { writer, space } = data;
  let condition, errMsg;

  const method = new XPHERE.SmartContract.Method({
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
    maxlength: XPHERE.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  const tokenId = op.load_param('tokenId');
  const tokenHash = op.id_hash(tokenId);

  const owner = op.read_universal('owner', tokenHash);
  const address = op.load_param('address');

  condition = op.ne(owner, null);
  errMsg = 'owner null.';
  method.addExecution(op.condition(condition, errMsg));

  condition = op.eq(owner, address);
  errMsg = 'address you entered is not owned by the owner.';
  method.addExecution(op.condition(condition, errMsg));

  // return list
  const inventory = op.read_universal(
    op.concat(['inventory_', address]),
    tokenHash
  );

  const response = op.response({
    tokenId: tokenId,
    owner: owner,
    info: inventory,
  });
  method.addExecution(response);

  return method;
}

function transfer(data: NFTParams) {
  const { writer, space } = data;
  let condition, errMsg, update;

  const method = new XPHERE.SmartContract.Method({
    type: 'contract',
    name: 'Transfer', // transfer
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'to',
    type: 'string',
    maxlength: XPHERE.Enc.ID_HASH_SIZE,
    requirements: true,
  });
  method.addParameter({
    name: 'tokenId',
    type: 'int',
    maxlength: 11,
    requirements: true,
  });

  const from = op.load_param('from');
  const to = op.load_param('to');
  const tokenId = op.load_param('tokenId');
  const tokenHash = op.id_hash(tokenId);

  const fromBalance = op.read_universal('balance', from, '0');
  const toBalance = op.read_universal('balance', to, '0');

  const owner = op.read_universal('owner', tokenHash);

  const inventoryTo = op.concat(['inventory_', to]);

  const inventoryFrom = op.concat(['inventory_', from]);
  const inventoryInfoOfFrom = op.read_universal(inventoryFrom, tokenHash);

  // from !== to
  condition = op.ne(from, to);
  errMsg = "You can't send to yourself.";
  method.addExecution(op.condition(condition, errMsg));

  // from === owner
  condition = op.eq(from, owner);
  errMsg = 'You are not the owner of the token.';
  method.addExecution(op.condition(condition, errMsg));

  // inventoryInfoOfFrom !== null
  condition = op.ne(inventoryInfoOfFrom, null);
  errMsg = 'the token ID does not exist in the address.';
  method.addExecution(op.condition(condition, errMsg));

  // fromBalance >= 1
  condition = op.gte(fromBalance, '1');
  errMsg = "You can't send more than what you have.";
  method.addExecution(op.condition(condition, errMsg));

  // owner = to;
  update = op.write_universal('owner', tokenHash, to);
  method.addExecution(update);

  // fromBalance = fromBalance - amount;
  const updateFromBalance = op.sub([fromBalance, '1']);
  update = op.write_universal('balance', from, updateFromBalance);
  method.addExecution(update);

  // toBalance = toBalance + amount;
  const updateToBalance = op.add([toBalance, '1']);
  update = op.write_universal('balance', to, updateToBalance);
  method.addExecution(update);

  // inventory: from = {}
  update = op.write_universal(inventoryFrom, tokenHash, {});
  method.addExecution(update);

  // inventory: to = token info
  update = op.write_universal(inventoryTo, tokenHash, inventoryInfoOfFrom);
  method.addExecution(update);

  return method;
}

function totalSupply(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'totalSupply',
    version: '1',
    space: space,
    writer: writer,
  });

  const totalSupplyHash = op.id_hash('totalSupply');
  const totalSupply = op.read_universal('collection', totalSupplyHash, '0');

  const response = op.response({ totalSupply });
  method.addExecution(response);

  return method;
}

function name(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'name',
    version: '1',
    space: space,
    writer: writer,
  });

  const nameHash = op.id_hash('name');
  const collectionName = op.read_universal('collection', nameHash);

  const condition = op.ne(collectionName, null);
  const errMsg = 'Collection name does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response(collectionName);
  method.addExecution(response);

  return method;
}

function symbol(data: NFTParams) {
  const { writer, space } = data;

  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'symbol',
    version: '1',
    space: space,
    writer: writer,
  });

  const symbolHash = op.id_hash('symbol');
  const symbol = op.read_universal('collection', symbolHash);

  const condition = op.ne(symbol, null);
  const errMsg = 'Token symbol does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response(symbol);
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
