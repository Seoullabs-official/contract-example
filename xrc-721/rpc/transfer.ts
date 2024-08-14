import { initConfigurationReturnKeyPair } from '../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = XPHERE.Enc.cid(keypair.address, SPACE);

    let transaction = {
      type: 'Transfer',
      cid,
      from: keypair.address,
      tokenId: '1',
      to: 'b44760c985e486f6adc6fa3419b092c44eb207b1ba7a',
    };

    let result = await XPHERE.Rpc.broadcastTransaction(
      XPHERE.Rpc.signedTransaction(transaction, keypair.private_key)
    );
    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
