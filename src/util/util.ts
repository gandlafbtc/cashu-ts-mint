import { KeysetPair } from "@cashu/crypto/modules/mint"
import { bytesToHex } from "@noble/curves/abstract/utils";
import { randomBytes } from "@noble/hashes/utils";
import { TokenState } from "../types"

export const getTokenState = (spendable: boolean, pending: boolean): TokenState => {
    if (spendable === true && pending === false) {
        return TokenState.LIVE
    }
    else if (spendable == false && pending == (true || false)) {
        return TokenState.BURNED
    }
    else if (spendable == true && pending == true) {
        return TokenState.IN_FLIGHT
    }
}

export const findPrivKeyForAmountFromKeyset = (keys: KeysetPair[], id:string, amount: number): Uint8Array => {
    return keys.find(kp => kp.keysetId === id).privKeys[amount]
}

export function randomHexString(len: number = 16) {
    return bytesToHex(randomBytes(len))
}
