import prompt from 'prompt-sync';
import * as path from 'path';
import * as fs from 'fs';
import XPHERE from 'xphere';

(async function () {
  const input = prompt({ sigint: true });
  console.log('Please enter the private key to import. ');
  const privateKey = input('> ');

  if (!XPHERE.Sign.keyValidity(privateKey)) {
    console.log('Invalid key: ' + privateKey);
    return false;
  }

  const keypair = {
    private_key: privateKey,
    public_key: XPHERE.Sign.publicKey(privateKey),
    address: XPHERE.Sign.address(XPHERE.Sign.publicKey(privateKey)),
  };

  const root = path.dirname(__dirname);
  const _output = JSON.stringify(keypair);
  await fs.promises.writeFile(root + '/keypair.json', _output);

  console.log('The key pair was imported successfully. ');
  console.log('Key pair: ');
  console.dir(keypair);
})();
