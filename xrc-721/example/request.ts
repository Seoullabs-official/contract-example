import { Keypair } from '../interface/IKeypair';

import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';

const SASEUL = require('saseul');

const SPACE = 'XRC Hans NFT 10';

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
    SASEUL.Rpc.endpoint(peer);

    const keypairContent = await fs.promises.readFile(keypairPath, {
      encoding: 'utf-8',
    });
    const keypair = JSON.parse(keypairContent);

    const cid = SASEUL.Enc.cid(keypair.address, SPACE);

    const xrc = await fetchXrcInfo(cid, keypair);

    console.log('name :: ', xrc.name);
    console.log('symbol :: ', xrc.symbol);
    console.log('totalSupply :: ', xrc.totalSupply);
    console.log('balance :: ', xrc.balance);
    console.log('listItems :: ', xrc.listItems);

    let ownerToken = await getOwnerToken(cid, keypair);

    let ownerInfo = await getOwnerInfo(cid, keypair, ownerToken);

    console.log('onwer :: ', ownerToken);
    console.log('ownerInfo :: ', ownerInfo);
  } catch (error) {
    console.error('Error: ', error);
  }
})();

async function fetchXrcInfo(cid: string, keypair: Keypair) {
  const privateKey = keypair.private_key;
  const address = keypair.address;

  const requestParams = [
    { type: 'name' },
    { type: 'symbol' },
    { type: 'ListTokenOf', page: 0, count: 3, address },
    { type: 'totalSupply' },
    { type: 'BalanceOf', address },
  ];

  const requests = requestParams.map((params) =>
    SASEUL.Rpc.request(SASEUL.Rpc.signedRequest({ cid, ...params }, privateKey))
  );

  const [name, symbol, listItems, totalSupply, balance] = await Promise.all(
    requests
  );

  return { name, symbol, listItems, totalSupply, balance };
}

async function getOwnerToken(cid: string, keypair: Keypair) {
  const privateKey = keypair.private_key;
  const request = await SASEUL.Rpc.request(
    SASEUL.Rpc.signedRequest({ cid, type: 'OwnerOf', tokenId: '1' }, privateKey)
  );
  return request.data.owner;
}

async function getOwnerInfo(cid: string, keypair: Keypair, owner: string) {
  const privateKey = keypair.private_key;
  const request = await SASEUL.Rpc.request(
    SASEUL.Rpc.signedRequest(
      { cid, type: 'GetInfo', tokenId: '1', address: owner },
      privateKey
    )
  );
  return request.data;
}
