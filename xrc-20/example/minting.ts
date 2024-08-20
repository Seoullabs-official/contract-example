import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import { Keypair } from '../types/keypairType';
import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const mintContract = async (
  keypair: Keypair,
  cid: string,
  amount: number
): Promise<any> => {
  const decimalRes = await getDecimal(keypair, cid);
  const decimal = decimalRes.data;

  const realAmount = amount * 10 ** decimal;

  const transaction = {
    cid,
    type: 'Mint',
    amount: realAmount.toString(),
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

    const issue = await issueContract(keypair, cid);
    console.log(issue, ':: issue');

    if (issue.code === 200) {
      await sleep(3000);
    }

    const mint = await mintContract(keypair, cid, 1000);
    console.log(mint, ':: mint');
  } catch (error) {
    console.error('Error:', error);
  }
})();
