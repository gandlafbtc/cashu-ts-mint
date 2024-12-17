import { BlindSignature, Proof } from "@cashu/crypto/modules/common"

export class MintError {
  code: number
  detail: string
  constructor(code: number, detail: string){
    this.code = code
    this.detail = detail
  }
}

export type Method = 'bolt11'

export type Unit = 'sat'

export type MintQuote = {
  quote: string
  request: string
  paid: boolean
  expiry: number
}
export type MintQuoteInternal = MintQuote & {
  hash: string,
  amount: number
}
export type MeltQuote = {
  quote: string
  amount: number
  paid: boolean
  expiry: number
  fee_reserve?: number 
}

export type Melt = {
    paid: boolean
    payment_preimage?:string
    change?: BlindSignature[]
}

export enum Version {
    V1 = '1.0.0'
} 

export type Invoice = {
  pr: string
  hash: string
  status: "OPEN"|"SETTLED"|"CANCELED"|"ACCEPTED"
}

export type Settings = {
        name: string
        pubkey: string
        version: Version
        description: string
        description_long: string
        contact: [string,string][]
        modt: string
        nuts: {
          "4": {
            methods: [
              [Method, Unit]
            ],
            disabled: false
          },
          "5": {
            methods: [
              [Method, Unit]
            ]
          },
          "7": {supported: boolean},
          "8": {supported: boolean},
          "9": {supported: boolean},
          "10": {supported: boolean},
          "12": {supported: boolean}
        }
}

export type Secret = Proof | {secret: Uint8Array}

export enum TokenState {
    LIVE='live',
    BURNED='burned',
    IN_FLIGHT='in-flight',
}

