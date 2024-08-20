import * as path from 'path';
import * as fs from 'fs';
import { ConfigIniParser } from 'config-ini-parser';
import XPHERE from 'xphere';

interface Keypair {
  address: string;
  private_key: string;
}

export async function initConfigurationReturnKeyPair(): Promise<{
  keypair: Keypair;
}> {
  // Navigate up to the directory
  const root = path.join(path.dirname(__dirname), '.');

  // Adjust paths to xphere.ini and keypair.json accordingly
  const _input = await fs.promises.readFile(path.join(root, 'xphere.ini'), {
    encoding: 'utf-8',
  });
  const parser = new ConfigIniParser();

  parser.parse(_input);

  const peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');

  XPHERE.Rpc.endpoint(peer);

  const json = await fs.promises.readFile(path.join(root, 'keypair.json'), {
    encoding: 'utf-8',
  });
  const keypair: Keypair = JSON.parse(json);

  return { keypair };
}
