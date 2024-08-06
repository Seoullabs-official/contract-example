import { initConfigurationReturnKeyPair } from '../utils/initConfig';

const SASEUL = require('saseul');

const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = SASEUL.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'Issue',
      name: 'issue01 -4',
      symbol: 'issue01 -4',
      from: keypair.address,
    };

    let result = await SASEUL.Rpc.broadcastTransaction(
      SASEUL.Rpc.signedTransaction(transaction, keypair.private_key)
    );

    console.log('issue ::  ' + result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
