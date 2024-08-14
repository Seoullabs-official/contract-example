import { initConfigurationReturnKeyPair } from '../utils/initConfig';

const SASEUL = require('saseul');

const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = SASEUL.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'totalSupply',
    };

    const total_supply = await SASEUL.Rpc.request(
      SASEUL.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(total_supply);
  } catch (error) {
    console.error('Error:', error);
  }
})();
