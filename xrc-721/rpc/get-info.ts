import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = XPHERE.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'GetInfo',
      tokenId: '1',
      address: keypair.address,
    };

    const info = await XPHERE.Rpc.request(
      XPHERE.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(info);
  } catch (error) {
    console.error('Error:', error);
  }
})();
