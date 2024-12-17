import { Invoice } from "../types";

export interface Lightning {
    getNewInvoice(amount: number): Promise<Invoice>
    getInvoice(hash:string): Promise<Invoice>
}