import { Mint } from "../interface/Mint";
import { Melt, Settings, Secret, MintQuote, MeltQuote, MintQuoteInternal } from "../types";
import { MintPersistence } from '../interface/Persistence';
import { MintError } from '../types/index';
import { findPrivKeyForAmountFromKeyset, randomHexString } from "../util/util";
import { KeysetPair,createBlindSignature,createNewMintKeys, verifyProof } from '@cashu/crypto/modules/mint';
import { BlindSignature, Keyset, Proof, SerializedBlindedMessage, pointFromHex } from "@cashu/crypto/modules/common";
import { serializeBlindedMessage, serializeProof } from "@cashu/crypto/modules/client";
import { settings } from "./Settings";
import { Lightning } from '../interface/Lightning';


export class CashuMint implements Mint {

    private persistence: MintPersistence
    private lightningInterface: Lightning

    constructor(persistence: MintPersistence, lightningInterface: Lightning) {
        this.persistence = persistence
        this.lightningInterface = lightningInterface
    }

    async createKeysetPair(): Promise<KeysetPair> {
        const mintKeys = createNewMintKeys(32)
        const persisted = await this.persistence.addKeyset(mintKeys)
        return persisted
    }

    async getKeys(keysetIds?: string[]): Promise<KeysetPair[]> {
        return await this.persistence.getKeys(keysetIds)
    }

    async getKeysets(): Promise<Keyset[]> {
        return await this.persistence.getKeysets()
    }

    async swap(inputs: Proof[], outputs: SerializedBlindedMessage[]): Promise<BlindSignature[]> {
        const isAmountMatch = inputs.reduce((prev, curr) => prev+curr.amount,0)===outputs.reduce((prev, curr) => prev+curr.amount,0)
        if (!isAmountMatch) {
            throw new MintError(110, 'input and output amount dont match');
        }
        const isValid = await this.validateProofs(inputs)
        if (!isValid) {
            throw new MintError(111, 'Token not valid');
        }
        //Support only one unit at a time
        const unit = await this.persistence.getUnitFromId(inputs[0]?.id)
        const keyset = await this.persistence.getActiveKeys(unit)
        const blindSignatures = outputs.map(o => createBlindSignature(pointFromHex(o.B_), findPrivKeyForAmountFromKeyset([keyset],keyset.keysetId, o.amount), o.amount, keyset.keysetId))
        return blindSignatures
    }

    async mintQuote(amount: number, method: "bolt11", unit: "sat"): Promise<MintQuote> {
        const invoice = await this.lightningInterface.getNewInvoice(amount)
        const mintQuote: MintQuoteInternal = {
            paid:false,
            expiry: Date.now()+settings.quoteExpiryMS,
            quote: randomHexString(),
            request: invoice.pr,
            hash: invoice.hash,
            amount
        }
        const mintQuoteInternal = await this.persistence.createMintQuote(mintQuote)
        delete mintQuoteInternal.hash
        return mintQuoteInternal
    }

    async getMintQuote(quote: string): Promise<MintQuoteInternal> {
        const mintQuote = await this.persistence.getMintQuote(quote)
        if (!mintQuote) {
            throw new MintError(120,'No mint quote found with id:' + quote)
        }
        const invoice = await this.lightningInterface.getInvoice(mintQuote.hash)
        if (invoice.status === "SETTLED") {
            mintQuote.paid = true
            this.persistence.updateMintQuote(mintQuote)
        }
        return mintQuote
    }

    async mint(quote: string, outputs: SerializedBlindedMessage[]): Promise<BlindSignature[]> {
        const mintQuote = await this.getMintQuote(quote)
        if (!mintQuote.paid) {
            throw new MintError(121,'Mint quote has not been paid:' + quote)
        }
        if (outputs.reduce((curr, acc)=>{return curr+acc.amount},0) > mintQuote.amount) {
            
        }
        const keysets = await this.getKeysets()
        const allKeys = await this.getKeys(keysets.map(k=>k.id))

        

        const signedOutputs = outputs.map((o)=> {
            const keys = allKeys.find(k=>k.keysetId===o.id)    
            if (keys===undefined) {
                throw new MintError(122,"An output contained an unknown keyset ID: "+o.id)
            }
            return createBlindSignature(o.B_, )})
        return signedOutputs
    }

    async getMeltQuote(quote: string): Promise<MeltQuote> {
        const meltQuote = await this.persistence.getMeltQuote(quote)
        if (!meltQuote) {
            throw new MintError(120,'No mint quote found with id:' + quote)
        }
        return meltQuote
    }

    meltQuote(request: string, unit: "sat"): Promise<MeltQuote> {
        throw new Error("Method not implemented.");
    }

    melt(quote: string, inputs: Proof[], outputs?: SerializedBlindedMessage[]): Promise<Melt> {
        throw new Error("Method not implemented.");
    }

    getSettings(): Promise<Settings> {
        throw new Error("Method not implemented.");
    }

    checkToken(proofs: Secret[]): Promise<{ spendable: boolean[]; pending: boolean[]; }> {
        throw new Error("Method not implemented.");
    }

    private async validateProofs(proofs: Proof[]): Promise<boolean> {
        const keysets = await this.getKeysets()
        const keysetIds = keysets.map(ks=> ks.id)
        const containsUnknownKeysetId = proofs.find(p=>!keysetIds.includes(p.id))
        if (containsUnknownKeysetId) {
            throw new MintError(100, "proofs contain unknown or disabled keyset ids")
        }
        const secrets = proofs.map(p=> serializeProof(p).secret)
        const containsSpentSecret = await this.persistence.containsSpentSecret(secrets)

        if (containsSpentSecret)  {
            throw new MintError(101, 'contains already spent proof');
        }
        const proofKeysets = [...new Set(proofs.map(p=> p.id))]
        const keys = await this.getKeys(proofKeysets)
        const containsInvalidProof = proofs.find(p => !verifyProof(p, findPrivKeyForAmountFromKeyset(keys, p.id,p.amount)))

        if (containsInvalidProof) {
            throw new MintError(102, 'contains invalid proof');
        }
        return true
    }


    
}