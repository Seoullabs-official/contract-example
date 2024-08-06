import nft from '../smart-contract/xrc721';

import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';

const SASEUL = require('saseul');

(async function () {
  const space = 'XRC Hans NFT 11';

  let root = path.join(path.dirname(__dirname), '..');
  let _input = await fs.promises.readFile(root + '/xphere.ini', {
    encoding: 'utf-8',
  });
  let parser = new ConfigIniParser();

  parser.parse(_input);

  let peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');

  SASEUL.Rpc.endpoint(peer);

  let json = await fs.promises.readFile(root + '/keypair.json', {
    encoding: 'utf-8',
  });
  let keypair = JSON.parse(json);

  let contract = new SASEUL.SmartContract.Contract(keypair.address, space);

  await contract.addMethod(
    nft.issue({ writer: keypair.address, space: space })
  );
  await contract.addMethod(nft.mint({ writer: keypair.address, space: space }));
  await contract.addMethod(
    nft.getInfo({ writer: keypair.address, space: space })
  );
  await contract.addMethod(nft.name({ writer: keypair.address, space: space }));
  await contract.addMethod(
    nft.symbol({ writer: keypair.address, space: space })
  );
  await contract.addMethod(
    nft.transfer({ writer: keypair.address, space: space })
  );
  await contract.addMethod(
    nft.totalSupply({ writer: keypair.address, space: space })
  );
  await contract.addMethod(
    nft.listItem({ writer: keypair.address, space: space })
  );
  await contract.addMethod(
    nft.ownerOf({ writer: keypair.address, space: space })
  );
  await contract.addMethod(
    nft.balanceOf({ writer: keypair.address, space: space })
  );

  await contract.publish(keypair.private_key);
})();
