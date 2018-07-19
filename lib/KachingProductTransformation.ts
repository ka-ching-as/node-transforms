import { HttpHeaders, ProductTransformation } from "./ProductTransformation"

export class KachingProductTransformation implements ProductTransformation {
    constructor() {}

    // We do not (yet) support deletion through the native Ka-ching format 
    isDeletionRequest(headers: HttpHeaders, body: any): boolean {
        return false
    }
    
    productIdForDeletion(input: any): string {
        throw new Error("Internal error - deletion is not supported through the native format")
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
