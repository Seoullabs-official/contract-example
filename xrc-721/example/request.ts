import { Keypair } from '../types/keypairType';

import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

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
    console.log('totalSupply :: ', xrc.totalSupply);
    console.log('balance :: ', xrc.balance);
    console.log('listItems :: ', xrc.listItems);
    console.log('tokenURI :: ', xrc.tokenURI);

    const ownerToken = await getOwnerToken(cid, keypair);

    const ownerInfo = await getOwnerInfo(cid, keypair, ownerToken);

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
    { type: 'Name' },
    { type: 'Symbol' },
    { type: 'ListTokenOf', page: 0, count: 3, address },
    { type: 'TotalSupply' },
    { type: 'BalanceOf', address },
    { type: 'TokenURI', tokenId: 1 },
  ];

  const requests = requestParams.map((params) =>
    XPHERE.Rpc.request(XPHERE.Rpc.signedRequest({ cid, ...params }, privateKey))
  );

  const [name, symbol, listItems, totalSupply, balance, tokenURI] =
    await Promise.all(requests);

  return { name, symbol, listItems, totalSupply, balance, tokenURI };
}

async function getOwnerToken(cid: string, keypair: Keypair) {
  const privateKey = keypair.private_key;
  const request = await XPHERE.Rpc.request(
    XPHERE.Rpc.signedRequest({ cid, type: 'OwnerOf', tokenId: 1 }, privateKey)
  );
  return request.data.owner;
}

async function getOwnerInfo(cid: string, keypair: Keypair, owner: string) {
  const privateKey = keypair.private_key;
  const request = await XPHERE.Rpc.request(
    XPHERE.Rpc.signedRequest(
      { cid, type: 'GetInfo', tokenId: 1, address: owner },
      privateKey
    )
  );
  return request.data;
}
