import { initConfigurationReturnKeyPair } from '../utils/initConfig';

const SASEUL = require('saseul');

let op = SASEUL.SmartContract.Operator;
const SPACE = 'XRC Hans NFT 11';

(async function () {
  try {
    let { keypair } = await initConfigurationReturnKeyPair();

    let cid = SASEUL.Enc.cid(keypair.address, SPACE);

    let transaction = {
      cid,
      type: 'name',
    };

    const name = await SASEUL.Rpc.request(
      SASEUL.Rpc.signedRequest(transaction, keypair.private_key)
    );
    console.log(name);
  } catch (error) {
    console.error('Error:', error);
  }
})();
