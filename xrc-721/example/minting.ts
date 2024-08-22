import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import { Keypair } from '../types/keypairType';
import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fileReaderReturnBase64Encoded = async (
  imagePath: string
): Promise<string> => {
  try {
    const data = await fs.promises.readFile(imagePath);
    return `data:image/jpeg;base64, ${Buffer.from(data).toString('base64')}`;
  } catch (error) {
    throw new Error(`Error reading file: ${error}`);
  }
};

const mintContract = async (
  keypair: Keypair,
  cid: string,
  base64data?: string
): Promise<any> => {
  const transaction = {
    cid,
    type: 'Mint',
    name: 'name',
    description: 'description',
    tokenId: 1,
    image: base64data,
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

const issueContract = async (keypair: Keypair, cid: string): Promise<any> => {
  const transaction = {
    cid,
    type: 'Issue',
    name: 'name',
    symbol: 'symbol',
  };
  return XPHERE.Rpc.broadcastTransaction(
    XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
  );
};

(async (): Promise<void> => {
  try {
    const root = path.join(path.dirname(__dirname), '..');
    const configPath = path.join(root, 'xphere.ini');
    const keypairPath = path.join(root, 'keypair.json');
    const imagePath = path.join(__dirname, '../images', '1.jpeg');

    const parser = new ConfigIniParser();
    const configContent = await fs.promises.readFile(configPath, {
      encoding: 'utf-8',
    });
    parser.parse(configContent);

    const peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');
    XPHERE.Rpc.endpoint(peer);

    const keypairContent = await fs.promises.readFile(keypairPath, {
      encoding: 'utf-8',
    });
    const keypair: Keypair = JSON.parse(keypairContent);
    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const nftExampleFileBase64 = await fileReaderReturnBase64Encoded(imagePath);

    const issue = await issueContract(keypair, cid);

    if (issue.code === 200) {
      await sleep(3000);
    }

    const mint = await mintContract(keypair, cid, nftExampleFileBase64);

    console.log(issue, ' :: issue ');
    console.log(mint, ' :: mint ');
  } catch (error) {
    console.error('Error:', error);
  }
})();
