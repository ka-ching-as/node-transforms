import * as _ from "lodash"
import { StockQueueEntry, StockTransformation } from "./StockTransformation"

export class KachingStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any): Promise<any> {
        for (const locationId in input) {
            const products = input[locationId]
    
            for (const productId in products) {
                const product = products[productId]
    
                if (typeof product === "number") {
                    const entry = {} as StockQueueEntry
                    entry.count = product
                    entry.location_id = locationId
                    entry.product_id = productId
                    return entry
                } else if (_.isObject(product)) {
                    for (const variantId in product) {
                        const variantCount = (product as any)[variantId]
    
                        if (typeof variantCount !== "number") {
                            console.warn(`Invalid kaching stock import product object: ${JSON.stringify(product)}`)
                            continue
                        }
    
                        const entry = {} as StockQueueEntry
                        entry.count = variantCount
                        entry.location_id = locationId
                        entry.product_id = productId
                        entry.variant_id = variantId
                        return entry
                    }
                }
            }
        }
    }
}