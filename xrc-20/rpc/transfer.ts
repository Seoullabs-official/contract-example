import { initConfigurationReturnKeyPair } from '../../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transaction = {
      type: 'Transfer',
      cid,
      to: 'b44760c985e486f6adc6fa3419b092c44eb207b1ba7a',
      amount: '1000000000000000000',
    };

    const result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );
    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
