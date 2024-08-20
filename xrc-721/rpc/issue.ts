import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = XPHERE.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'Issue',
      name: 'name',
      symbol: 'symbol',
      from: keypair.address,
    };

    let result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );

    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
