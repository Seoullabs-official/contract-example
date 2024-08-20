import { initConfigurationReturnKeyPair } from '../../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transaction = {
      cid,
      type: 'Issue',
      name: 'Token name',
      symbol: 'Token symbol',
      decimal: 18,
    };

    const result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );

    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
