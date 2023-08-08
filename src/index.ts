import { Address, Script, Signer, Tap, Tx } from '@cmdcode/tapscript'
import { ecc, util } from '@cmdcode/crypto-utils'
import { blockchainRequest } from './bitcoin'
import { getTapScript } from './generate-tapscript'
import { getTaptree } from './generate-taptree'

(async function() {
  await getTaptree();
  // await getTapScript();
})()