import { initConfigurationReturnKeyPair } from '../utils/initConfig';
import * as fs from 'fs';
import * as path from 'path';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

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

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);
    const imagePath = path.join(__dirname, '../images', '1.jpeg');

    const nftExampleFileBase64 = await fileReaderReturnBase64Encoded(imagePath);

    const transaction = {
      cid,
      type: 'Mint',
      name: 'XPHERE Token',
      description: 'description',
      tokenId: 1,
      image: nftExampleFileBase64,
    };

    const result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );
    console.log('Mint ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
