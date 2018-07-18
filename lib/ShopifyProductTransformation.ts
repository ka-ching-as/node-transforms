import * as htmlToText from "html-to-text"
import { HttpHeaders, ProductTransformation } from "./ProductTransformation"

export class ShopifyProductTransformation implements ProductTransformation {
    constructor() {}

    isDeletionRequest(headers: HttpHeaders, body: any): boolean {
        const topic = headers["x-shopify-topic"]
        if (topic === "products/delete") {
            return true
        } else {
            return false
        }
    }
    
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input: any): any {
        const requiredFields = ["id", "title"]

        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`)
            }
        }
    
        const product: any = {}
        product.id = `${input.id}`
        product.name = input.title
    
        if (input.image && input.image.src) {
            product.image_url = input.image.src
        }
    
        if (input.body_html) {
            product.description = htmlToText.fromString(input.body_html)
        }
    
        if (input.variants && Array.isArray(input.variants) && input.variants.length > 0) {
            const firstVariant = input.variants[0]
            if (firstVariant.price) {
                product.retail_price = Number(firstVariant.price)
            }
        }
        return product
    }

    transformRepoProduct(input: any, channels: string[], markets: string[]): any {
        const product = this.transformProduct(input)
        const metadata = { markets: {} as any, channels: {} as any }
        for (const channel of channels) {
            metadata.channels[channel] = true
        }
        for (const market of markets) {
            metadata.markets[market] = true
        }
        
        const obj = { product: product, metadata: metadata }
        return obj
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
