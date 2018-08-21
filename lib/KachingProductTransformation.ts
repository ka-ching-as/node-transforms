import * as express from "express"
import { ProductTransformation } from "./ProductTransformation"

export class KachingProductTransformation implements ProductTransformation {
    constructor() {}

    // We do not (yet) support deletion through the native Ka-ching format 
    isDeletionRequest(request: express.Request): boolean {
        if (request.method === "DELETE") {
            return true
        }
        return false
    }
    
    productIdsForDeletion(request: express.Request): string[] {
        const ids = request.query.ids
        if (typeof ids === "string") {
            return ids.split(",")
        }
        const id = request.query.id
        if (typeof ids === "string") {
            return [id]
        }
        return []
    }

    async transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>) {
        if (input.product) {
            await callback(input)
        } else if (input.products) {
            for (const key in input.products) {
                const product = input.products[key]
                const obj: any = { product: product }
                if (input.metadata) {
                    obj["metadata"] = input.metadata
                }
                if (input.shops) {
                    obj["shops"] = input.shops
                }
                await callback(obj)
            }
        } else {
            throw new Error("Bad request - missing product or products key in body.")
        }
    }
}
