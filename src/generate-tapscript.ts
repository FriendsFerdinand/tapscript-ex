import { Address, Script, Signer, Tap, Tx } from '@cmdcode/tapscript'
import { ecc, util } from '@cmdcode/crypto-utils'
import { blockchainRequest } from './bitcoin'

export async function getTapScript() {
  const secretkey = "bc20f7801e4c5f9b088487fadc085a036e04c164e8e178ab5cb468086a9b0c00";
  const pubkey = ecc.get_pubkey(secretkey, true);
  // console.log(Buffer.from(pubkey).toString("hex"));

  // For key-spends, we need to tweak both the secret key and public key.
  const [ tseckey ] = Tap.getSecKey(secretkey)
  // Our taproot address is the encoded version of our public tapkey.
  // console.log(pubkey.hex);
  const script = [ Buffer.from("3c001a7321b74e2b6a7e949e6c4ad313035b166509501700", "hex"), "OP_DROP", pubkey, "OP_CHECKSIG" ]
  const scriptBytes = Script.encode(script)
  const tapleaf = Tap.tree.getLeaf(scriptBytes)

  const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })

  const address = Address.p2tr.encode(tpubkey, 'testnet')

  // NOTE: For the next step, you need to send 100_000 sats to the above address.
  // Make note of the txid of this transaction, plus the index of the output that
  // you are spending.
  // 0x183c001a7321b74e2b6a7e949e6c4ad313035b1665095017007520f855ca43402fb99cde0e3e634b175642561ff584fe76d1686630d8fd2ea93b36ac
  const txdata = Tx.create({
    vin  : [{
      // The txid of your funding transaction.
      txid: '3f18f204c8dc3262b7c392b521626b0cb627fb74efcc25a224f510e3aa6c88e1',
      // The index of the output you are spending.
      vout: 0,
      // For Taproot, we need to specify this data when signing.
      prevout: {
        // The value of the output we are spending.
        value: 10000,
        // This is the script that our taproot address decodes into.
        scriptPubKey: [ 'OP_1', tpubkey ]
      },
    }],
    vout : [{
      // We are locking up 9_000 sats (minus 1000 sats for fees.)
      value: 9000,
      // We are locking up funds to this address.
      scriptPubKey: Address.toScriptPubKey("mhFYpJ9J4E37GBBvtoPnCuEYkdYbDEpeLC")
    }]
  })

  // For this example, we are signing for input 0.

  // Provide your tweaked secret key with the transaction, 
  // plus the index # of the input you are signing for.

  const sig = Signer.taproot.sign(secretkey, txdata, 0, { extension: tapleaf })

  // Add the signature to our witness data for input 0, along with the script
  // and merkle proof (cblock) for the script.
  txdata.vin[0].witness = [ sig.hex, script, cblock ]

  // console.log(sig.hex)
  // console.log("\n")
  // console.log(Buffer.from(script[0]).toString("hex"))
  console.log(Script.fmt.toAsm(script))
  // console.log(Buffer.from(Script.encode(script[1])).toString("hex"))
  // console.log(cblock)
  // Add your signature to the witness data for that input.
  const isValid = Signer.taproot.verify(txdata, 0, { pubkey })

  console.log('Your address:', address)
  console.log('Your txhex:', Buffer.from(Tx.encode(txdata).hex, "hex").toString("hex"))

  // const result = await blockchainRequest("sendrawtransaction", [Tx.encode(txdata).hex])
  // console.log(result)
}