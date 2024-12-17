import { KeysetPair } from '@cashu/crypto/modules/mint';
import { Melt, MeltQuote, Method, MintQuote, Secret, Settings, Unit } from '../types';
import { BlindSignature, Keyset, Proof, SerializedBlindedMessage } from '@cashu/crypto/modules/common';


export interface Mint {
    // NUT 01
    createKeysetPair(): Promise<KeysetPair>
    getKeys(keysetIds?: string[]): Promise<KeysetPair[]>
    
    // NUT 02
    getKeysets(): Promise<Keyset[]>

    // NUT 03
    swap(inputs: Proof[], outputs: SerializedBlindedMessage[]): Promise<BlindSignature[]>

    // NUT 04
    mintQuote(amount: number, method: Method, unit: Unit): Promise<MintQuote>
    getMintQuote(quote:string): Promise<MintQuote>
    mint(quote: string, outputs: SerializedBlindedMessage[]): Promise<BlindSignature[]> 

    // NUT 05 & NUT 08
    meltQuote(request: string, unit: Unit): Promise<MeltQuote>
    getMeltQuote(quote:string): Promise<MeltQuote>
    melt(quote: string, inputs: Proof[], outputs?: SerializedBlindedMessage[]): Promise<Melt>

    // NUT 06
    getSettings(): Promise<Settings>

    // NUT 07
    checkToken(proofs: Secret[]): Promise<{spendable: boolean[], pending: boolean[]}>
}