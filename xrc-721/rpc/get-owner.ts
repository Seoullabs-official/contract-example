import { initConfigurationReturnKeyPair } from '../utils/initConfig';

const SASEUL = require('saseul');

const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = SASEUL.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'OwnerOf',
      tokenId: 1,
    };

    const owner = await SASEUL.Rpc.request(
      SASEUL.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(owner);
  } catch (error) {
    console.error('Error:', error);
  }
})();
