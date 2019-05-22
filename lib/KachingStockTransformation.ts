import * as _ from "lodash"
import { StockQueueEntry, StockTransformation } from "./StockTransformation"

export class KachingStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any, callback: (stockQueueElement: any) => Promise<void>): Promise<void> {
        for (const locationId in input) {
            const products = input[locationId]
    
            for (const productId in products) {
                const product = products[productId]
    
                if (typeof product === "number") {
                    const entry = {} as StockQueueEntry
                    entry.count = product
                    entry.location_id = locationId
                    entry.product_id = productId

                    await callback(entry)
                } else if (_.isObject(product)) {
                    for (const variantId in product) {
                        const variantCount = product[variantId]
    
                        if (typeof variantCount !== "number") {
                            console.warn(`Invalid kaching stock import product object: ${JSON.stringify(product)}`)
                            continue
                        }
    
                        const entry = {} as StockQueueEntry
                        entry.count = variantCount
                        entry.location_id = locationId
                        entry.product_id = productId
                        entry.variant_id = variantId
    
                        await callback(entry)
                    }
                }
            }
        }
    }
}