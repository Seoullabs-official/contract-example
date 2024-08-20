import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transaction = {
      type: 'Transfer',
      cid,
      from: keypair.address,
      tokenId: 1,
      to: 'b44760c985e486f6adc6fa3419b092c44eb207b1ba7a',
    };

    const result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );
    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
