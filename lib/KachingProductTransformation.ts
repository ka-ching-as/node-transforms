import { HttpHeaders, ProductTransformation } from "./ProductTransformation"

export class KachingProductTransformation implements ProductTransformation {
    constructor() {}

    isDeletionRequest(headers: HttpHeaders, body: any): boolean {
        return false
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

    productIdForDeletion(input: any): string {
        const requiredFields = ["id"]

        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`)
            }
        }
        return input.id
    }
}
