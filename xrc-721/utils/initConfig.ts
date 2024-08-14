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
  // Navigate up to the directory containing xphere-721
  let root = path.join(path.dirname(__dirname), '..');

  // Adjust paths to xphere.ini and keypair.json accordingly
  let _input = await fs.promises.readFile(path.join(root, 'xphere.ini'), {
    encoding: 'utf-8',
  });
  let parser = new ConfigIniParser();

  parser.parse(_input);

  let peer = parser.get('Network', 'peers[]').replace(/^"(.*)"$/, '$1');

  XPHERE.Rpc.endpoint(peer);

  let json = await fs.promises.readFile(path.join(root, 'keypair.json'), {
    encoding: 'utf-8',
  });
  let keypair: Keypair = JSON.parse(json);

  return { keypair };
}
