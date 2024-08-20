import XPHERE from 'xphere';

const op = XPHERE.SmartContract.Operator;

export function issue(writer: string, space: string, publisher: string) {
  let condition, errMsg, update;

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
  method.addParameter({
    name: 'decimal',
    type: 'int',
    maxlength: 2,
    requirements: true,
  });

  const from = op.load_param('from');
  const name = op.load_param('name');
  const symbol = op.load_param('symbol');
  const decimal = op.load_param('decimal');

  const nameHash = op.id_hash('name');
  const symbolHash = op.id_hash('symbol');
  const decimalHash = op.id_hash('decimal');
  const publisherHash = op.id_hash('publisher');

  const alreadyToken = op.read_universal('token', nameHash);

  // alreadyToken === null
  condition = op.eq(alreadyToken, null);
  errMsg = 'The token can only be issued once.';
  method.addExecution(op.condition(condition, errMsg));

  // writer === from
  condition = op.eq(writer, from);
  errMsg = 'You are not the contract writer.';
  method.addExecution(op.condition(condition, errMsg));

  // decimal >= 0
  condition = op.gte(decimal, '0');
  errMsg = 'The decimal must be greater than or equal to 0.';
  method.addExecution(op.condition(condition, errMsg));

  // save info
  update = op.write_universal('token', nameHash, name);
  method.addExecution(update);

  update = op.write_universal('token', symbolHash, symbol);
  method.addExecution(update);

  update = op.write_universal('token', decimalHash, decimal);
  method.addExecution(update);

  update = op.write_universal('token', publisherHash, publisher);
  method.addExecution(update);

  return method;
}

export function mint(writer: string, space: string) {
  let condition, errMsg, update;

  const method = new XPHERE.SmartContract.Method({
    type: 'contract',
    name: 'Mint',
    version: '1',
    space: space,
    writer: writer,
  });

  method.addParameter({
    name: 'amount',
    type: 'string',
    maxlength: 80,
    requirements: true,
  });
  method.addParameter({
    name: 'address',
    type: 'string',
    maxlength: XPHERE.Enc.ID_HASH_SIZE,
    requirements: true,
  });

  const amount = op.load_param('amount');
  const address = op.load_param('address');

  const totalSupplyHash = op.id_hash('totalSupply');

  const nameHash = op.id_hash('name');
  const tokenName = op.read_universal('token', nameHash);

  condition = op.ne(tokenName, null);
  errMsg = 'The token has not been issued yet.';
  method.addExecution(op.condition(condition, errMsg));

  // amount > 0
  condition = op.gt(amount, '0');
  errMsg = 'The amount must be greater than 0.';
  method.addExecution(op.condition(condition, errMsg));

  const totalSupply = op.read_universal('token', totalSupplyHash, '0');
  update = op.write_universal(
    'token',
    totalSupplyHash,
    op.add([totalSupply, amount])
  );
  method.addExecution(update);

  const balance = op.read_universal('balance', address, '0');
  update = op.write_universal('balance', address, op.add([balance, amount]));
  method.addExecution(update);

  return method;
}

export function transfer(writer: string, space: string) {
  let condition, errMsg, update;
  const method = new XPHERE.SmartContract.Method({
    type: 'contract',
    name: 'Transfer',
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
    name: 'amount',
    type: 'string',
    maxlength: 40,
    requirements: true,
  });

  const from = op.load_param('from');
  const to = op.load_param('to');
  const amount = op.load_param('amount');

  const fromBalance = op.read_universal('balance', from, '0');
  const toBalance = op.read_universal('balance', to, '0');

  // from !== to
  condition = op.ne(from, to);
  errMsg = "You can't send to yourself.";
  method.addExecution(op.condition(condition, errMsg));

  // amount > 0
  condition = op.gt(amount, '0');
  errMsg = 'The amount must be greater than 0.';
  method.addExecution(op.condition(condition, errMsg));

  // fromBalance >= amount
  condition = op.gte(fromBalance, amount);
  errMsg = "You can't send more than what you have.";
  method.addExecution(op.condition(condition, errMsg));

  // fromBalance = fromBalance - amount;
  update = op.write_universal('balance', from, op.sub([fromBalance, amount]));
  method.addExecution(update);

  // toBalance = toBalance + amount;
  update = op.write_universal('balance', to, op.add([toBalance, amount]));
  method.addExecution(update);

  return method;
}

export function balanceOf(writer: string, space: string) {
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
  const response = op.response({
    balance,
  });
  method.addExecution(response);

  return method;
}

export function totalSupply(writer: string, space: string) {
  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'TotalSupply',
    version: '1',
    space: space,
    writer: writer,
  });

  const totalSupplyHash = op.id_hash('totalSupply');
  const totalSupply = op.read_universal('token', totalSupplyHash, '0');

  const response = op.response({ totalSupply });
  method.addExecution(response);

  return method;
}

export function name(writer: string, space: string) {
  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'Name',
    version: '1',
    space: space,
    writer: writer,
  });

  const nameHash = op.id_hash('name');
  const tokenName = op.read_universal('token', nameHash);

  const condition = op.ne(tokenName, null);
  const errMsg = 'Token name does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response(tokenName);
  method.addExecution(response);

  return method;
}

export function symbol(writer: string, space: string) {
  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'Symbol',
    version: '1',
    space: space,
    writer: writer,
  });

  const symbolHash = op.id_hash('symbol');
  const symbol = op.read_universal('token', symbolHash);

  const condition = op.ne(symbol, null);
  const errMsg = 'Token symbol does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response(symbol);
  method.addExecution(response);

  return method;
}

export function decimals(writer: string, space: string) {
  const method = new XPHERE.SmartContract.Method({
    type: 'request',
    name: 'Decimals',
    version: '1',
    space: space,
    writer: writer,
  });

  const decimalHash = op.id_hash('decimal');
  const decimal = op.read_universal('token', decimalHash);

  const condition = op.ne(decimal, null);
  const errMsg = 'Token decimal does not exist.';
  method.addExecution(op.condition(condition, errMsg));

  const response = op.response(decimal);
  method.addExecution(response);

  return method;
}
