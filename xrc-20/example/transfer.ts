import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import { Keypair } from '../types/keypairType';
import XPHERE from 'xphere';

const space = 'XPHERE TOKEN';

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

    const transferResult = await transfer(keypair, cid);

    console.log(transferResult, ':: transfer');
  } catch (error) {
    console.error('Error:', error);
  }
})();
