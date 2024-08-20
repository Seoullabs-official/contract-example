import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transaction = {
      cid,
      type: 'Symbol',
    };

    const symbol = await XPHERE.Rpc.request(
      XPHERE.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(symbol);
  } catch (error) {
    console.error('Error:', error);
  }
})();
