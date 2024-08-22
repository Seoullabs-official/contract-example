import * as path from 'path';
import * as fs from 'fs';

(async function () {
  const root = path.dirname(__dirname);
  const json = await fs.promises.readFile(root + '/keypair.json', {
    encoding: 'utf-8',
  });
  const keypair = JSON.parse(json);

  console.dir(keypair);
})();
