import {
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
} from '../smart-contract/xrc721';

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

  contract.addMethod(issue({ writer: keypair.address, space: space }));
  contract.addMethod(mint({ writer: keypair.address, space: space }));
  contract.addMethod(getInfo({ writer: keypair.address, space: space }));
  contract.addMethod(name({ writer: keypair.address, space: space }));
  contract.addMethod(symbol({ writer: keypair.address, space: space }));
  contract.addMethod(transfer({ writer: keypair.address, space: space }));
  contract.addMethod(totalSupply({ writer: keypair.address, space: space }));
  contract.addMethod(listItem({ writer: keypair.address, space: space }));
  contract.addMethod(ownerOf({ writer: keypair.address, space: space }));
  contract.addMethod(balanceOf({ writer: keypair.address, space: space }));
  contract.addMethod(tokenURI({ writer: keypair.address, space: space }));

  await contract.publish(keypair.private_key);
})();
