import { Keyset } from "@cashu/crypto/modules/common";
import { KeysetPair } from '@cashu/crypto/modules/mint';
import { MintQuote,MeltQuote, Unit, MintQuoteInternal } from "../types";

export interface MintPersistence {
    getKeys(keysetId?: string[]): Promise<KeysetPair[]> 
    getActiveKeys(unit?: Unit): Promise<KeysetPair>
    addKeyset(keysetPair: KeysetPair): Promise<KeysetPair>
    getKeysets(): Promise<Keyset[]>
    modifyKeysetStatus(keysetId: string, isEnabled: boolean): Promise<Keyset>
    containsSpentSecret(secret: string[]): Promise<boolean>
    getUnitFromId(id: string): Promise<Unit|undefined>
    createMintQuote(quote: MintQuoteInternal): Promise<MintQuoteInternal>
    createMeltQuote(): Promise<MeltQuote>
    updateMeltQuote(quote: MeltQuote): Promise<MeltQuote>
    updateMintQuote(quote: MintQuote): Promise<MintQuote>
    getMintQuote(quote: string): Promise<MintQuoteInternal>
    getMeltQuote(quote: string): Promise<MeltQuote>
}