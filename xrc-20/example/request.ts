import { Keypair } from '../types/keypairType';

import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN 3';

async function fetchXrcInfo(cid: string, keypair: Keypair) {
  const privateKey = keypair.private_key;
  const address = keypair.address;

  const requestParams = [
    { type: 'Name' },
    { type: 'Symbol' },
    { type: 'Decimals' },
    { type: 'TotalSupply' },
    { type: 'BalanceOf', address },
  ];

  const requests = requestParams.map((params) =>
    XPHERE.Rpc.request(XPHERE.Rpc.signedRequest({ cid, ...params }, privateKey))
  );

  const [name, symbol, decimals, totalSupply, balance] = await Promise.all(
    requests
  );

  return { name, symbol, decimals, totalSupply, balance };
}

(async function () {
  try {
    let root = path.join(path.dirname(__dirname), '..');
    const configPath = path.join(root, 'xphere.ini');
    const keypairPath = path.join(root, 'keypair.json');

    const configContent = await fs.promises.readFile(configPath, {
      encoding: 'utf-8',
    });
    const parser = new ConfigIniParser();
    parser.parse(configContent);

    const peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');
    XPHERE.Rpc.endpoint(peer);

    const keypairContent = await fs.promises.readFile(keypairPath, {
      encoding: 'utf-8',
    });
    const keypair = JSON.parse(keypairContent);

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const xrc = await fetchXrcInfo(cid, keypair);

    console.log('name :: ', xrc.name);
    console.log('symbol :: ', xrc.symbol);
    console.log('decimals :: ', xrc.decimals);
    console.log('totalSupply :: ', xrc.totalSupply);
    console.log('balance :: ', xrc.balance);
  } catch (error) {
    console.error('Error: ', error);
  }
})();
