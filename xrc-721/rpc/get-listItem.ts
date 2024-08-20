import { initConfigurationReturnKeyPair } from '../../utils/initConfig';

import XPHERE from 'xphere';

const SPACE = 'XPHERE TOKEN';

(async function () {
  try {
    const { keypair } = await initConfigurationReturnKeyPair();

    const cid = XPHERE.Enc.cid(keypair.address, SPACE);

    const transaction = {
      cid,
      type: 'ListTokenOf',
      page: 0,
      count: 3,
      address: keypair.address,
    };

    const listItem = await XPHERE.Rpc.request(
      XPHERE.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(listItem);
  } catch (error) {
    console.error('Error:', error);
  }
})();
