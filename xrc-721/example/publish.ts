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
  const SPACE = 'XPHERE TOKEN';

  const root = path.join(path.dirname(__dirname), '..');
  const _input = await fs.promises.readFile(root + '/xphere.ini', {
    encoding: 'utf-8',
  });
  const parser = new ConfigIniParser();

  parser.parse(_input);

  const peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');

  XPHERE.Rpc.endpoint(peer);

  const json = await fs.promises.readFile(root + '/keypair.json', {
    encoding: 'utf-8',
  });
  const keypair = JSON.parse(json);

  const contract = new XPHERE.SmartContract.Contract(keypair.address, SPACE);

  contract.addMethod(issue({ writer: keypair.address, space: SPACE }));
  contract.addMethod(mint({ writer: keypair.address, space: SPACE }));
  contract.addMethod(getInfo({ writer: keypair.address, space: SPACE }));
  contract.addMethod(name({ writer: keypair.address, space: SPACE }));
  contract.addMethod(symbol({ writer: keypair.address, space: SPACE }));
  contract.addMethod(transfer({ writer: keypair.address, space: SPACE }));
  contract.addMethod(totalSupply({ writer: keypair.address, space: SPACE }));
  contract.addMethod(listItem({ writer: keypair.address, space: SPACE }));
  contract.addMethod(ownerOf({ writer: keypair.address, space: SPACE }));
  contract.addMethod(balanceOf({ writer: keypair.address, space: SPACE }));
  contract.addMethod(tokenURI({ writer: keypair.address, space: SPACE }));

  await contract.publish(keypair.private_key);
})();
