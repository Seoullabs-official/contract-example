import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import { Keypair } from '../types/keypairType';
import XPHERE from 'xphere';

const space = 'XPHERE TOKEN 3';

const transfer = async (keypair: Keypair, cid: string): Promise<any> => {
  const transaction = {
    type: 'Transfer',
    cid,
    to: 'b44760c985e486f6adc6fa3419b092c44eb207b1ba7a',
    amount: '100',
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

const mintContract = async (keypair: Keypair, cid: string): Promise<any> => {
  const transaction = {
    cid,
    type: 'Mint',
    amount: '1000',
    address: keypair.address,
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

const issueContract = async (keypair: Keypair, cid: string): Promise<any> => {
  const transaction = {
    cid,
    type: 'Issue',
    name: 'Token name',
    symbol: 'Token symbol',
    decimal: 18,
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

(async (): Promise<void> => {
  try {
    let root = path.join(path.dirname(__dirname), '..');
    const configPath = path.join(root, 'xphere.ini');
    const keypairPath = path.join(root, 'keypair.json');

    const parser = new ConfigIniParser();
    const configContent = await fs.promises.readFile(configPath, {
      encoding: 'utf-8',
    });
    parser.parse(configContent);

    // Set the XPHERE RPC endpoint
    const peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');
    XPHERE.Rpc.endpoint(peer);

    // Read the keypair file
    const keypairContent = await fs.promises.readFile(keypairPath, {
      encoding: 'utf-8',
    });
    const keypair: Keypair = JSON.parse(keypairContent);
    const cid = XPHERE.Enc.cid(keypair.address, space);

    let issue = await issueContract(
      { address: keypair.address, private_key: keypair.private_key },
      cid
    );
    let mint = await mintContract(
      { address: keypair.address, private_key: keypair.private_key },
      cid
    );
    // const transferResult = await transfer(keypair, cid);

    // console.log(transferResult, ':: transfer');
    console.log(issue, ':: issue');
    console.log(mint, ':: mint');
  } catch (error) {
    console.error('Error:', error);
  }
})();
