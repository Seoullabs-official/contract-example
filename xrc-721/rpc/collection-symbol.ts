import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = XPHERE.Enc.cid(keypair.address, SPACE);

    let transaction = {
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
