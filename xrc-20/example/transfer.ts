import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import { Keypair } from '../types/keypairType';
import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

const transfer = async (
  keypair: Keypair,
  cid: string,
  amount: number
): Promise<any> => {
  const decimalRes = await getDecimal(keypair, cid);
  const decimal = decimalRes.data;

  const realAmount = amount * 10 ** decimal;

  const transaction = {
    type: 'Transfer',
    cid,
    to: 'b44760c985e486f6adc6fa3419b092c44eb207b1ba7a',
    amount: realAmount.toString(),
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

const getDecimal = async (keypair: Keypair, cid: string): Promise<any> => {
  const transaction = {
    cid,
    type: 'Decimals',
  };
  return XPHERE.Rpc.request(
    XPHERE.Rpc.signedRequest(transaction, keypair.private_key)
  );
};

(async (): Promise<void> => {
  try {
    const root = path.join(path.dirname(__dirname), '..');
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
    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transferResult = await transfer(keypair, cid, 100);

    console.log(transferResult, ':: transfer');
  } catch (error) {
    console.error('Error:', error);
  }
})();
