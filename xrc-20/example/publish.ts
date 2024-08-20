import {
  issue,
  mint,
  transfer,
  balanceOf,
  totalSupply,
  name,
  symbol,
  decimals,
} from '../smart-contract/xrc-20';

import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';

import XPHERE from 'xphere';

(async function () {
  const space = 'XPHERE TOKEN';

  let root = path.join(path.dirname(__dirname), '..');
  let _input = await fs.promises.readFile(root + '/xphere.ini', {
    encoding: 'utf-8',
  });
  let parser = new ConfigIniParser();

  parser.parse(_input);

  let peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');

  XPHERE.Rpc.endpoint(peer);

  let json = await fs.promises.readFile(root + '/keypair.json', {
    encoding: 'utf-8',
  });
  let keypair = JSON.parse(json);

  let contract = new XPHERE.SmartContract.Contract(keypair.address, space);

  contract.addMethod(issue(keypair.address, space, keypair.address));
  contract.addMethod(mint(keypair.address, space));
  contract.addMethod(transfer(keypair.address, space));
  contract.addMethod(balanceOf(keypair.address, space));
  contract.addMethod(totalSupply(keypair.address, space));
  contract.addMethod(name(keypair.address, space));
  contract.addMethod(symbol(keypair.address, space));
  contract.addMethod(decimals(keypair.address, space));

  contract.publish(keypair.private_key);
})();
