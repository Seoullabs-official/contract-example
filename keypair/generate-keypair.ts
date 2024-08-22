import * as path from 'path';
import * as fs from 'fs';
import XPHERE from 'xphere';

(async function () {
  const root = path.dirname(__dirname);
  const keypair = XPHERE.Sign.keyPair();
  const _output = JSON.stringify(keypair);
  await fs.promises.writeFile(root + '/keypair.json', _output);

  console.log('A new key pair has been successfully generated.');
  console.log('Key pair: ');
  console.dir(keypair);
})();
