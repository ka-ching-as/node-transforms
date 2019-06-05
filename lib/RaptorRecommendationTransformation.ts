import * as express from "express"
import * as parse from "csv-parse"
import { RecommendationTransformation, RecommendationQueueEntry } from "./RecommendationTransformation"

export class RaptorRecommendationTransformation implements RecommendationTransformation {

    // Until we require explicit transform param in the query string we have to do this. We did the same before, just in the functions project.
    canHandleRequest(request: express.Request): boolean {
        const contentType: string | undefined = request.get("Content-Type")!
        if (contentType.includes("application/json")) {
            return this.isRaptorJSONFormat(request.body)
        } else if (contentType.includes("text/csv")) {
            return true
        }
        return false
    }

    async transformToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void> {
        if (this.isRaptorJSONFormat(input)) {
            await this.transformJSONToRecommendationImportData(input, callback)
        } else {
            await this.transformCSVToRecommendationImportData(input, callback)
        }
    }

    /* Example data
    RecommendedId;Priority;ProductID
    -L6Q_LjeIwMbW7w-MU6T;1;-L6QZDxE6JJb9ifQAay5
    */
    private async transformCSVToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void> {
        const output = await this.parsePromise(input)
        let fields: string[] = []

        let product: any | undefined = undefined

        for (const entry of output) {
            if (fields.length === 0) {
                fields = entry
                continue
            }

            let productId: string | undefined = undefined
            let recommendedId: string | undefined = undefined
            for (const index in entry) {
                const value = entry[index]
                const key = fields[index]

                if (key === "ProductID") {
                    productId = value
                } else if (key === "RecommendedId") {
                    recommendedId = value
                }
            }

            if (productId === undefined || recommendedId === undefined) {
                continue
            }

            const existingProductId = (product || {}).product_id
            if (productId !== existingProductId) {
                // Add product to updates and reset product
                if (product !== undefined) {
                    await callback(product)
                }
                product = { product_id: productId }
            }
            product.recommendations = (product.recommendations || [])
            product.recommendations.push(recommendedId)
        }
        if (product !== undefined && product.recommendations !== undefined) {
            await callback(product)
        }
    }

    /* Example data
    [ { "ProductId": "-L6QZDxE6JJb9ifQAay5", "Priority": "1", "RecommendedId": "-L6Q_LjeIwMbW7w-MU6T" }]
    */
    private async transformJSONToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void> {
        if (!Array.isArray(input)) {
            throw new Error("Expecting an array")
        }
        const array = input as any[]
    
        let product: any | undefined = undefined
    
        for (const entry of array) {
    
            const productId: string | undefined = entry.ProductId
            const recommendedId: string | undefined = entry.RecommendedId
    
            if (productId === undefined || recommendedId === undefined) {
                continue
            }
    
            const existingProductId = (product || {}).product_id
    
            if (productId !== existingProductId) {
                // Add product to updates and reset product
                if (product !== undefined) {
                    await callback(product)
                }
                product = { product_id: productId }
            }
            product.recommendations = (product.recommendations || [])
            product.recommendations.push(recommendedId)
        }
        if (product !== undefined && product.recommendations !== undefined) {
            await callback(product)
        }
    }

    private isRaptorJSONFormat(input: any): boolean {
        if (!Array.isArray(input)) {
            return false
        }
        const array = input as any[]
        if (array.length === 0) {
            return false
        }
        const first = array[0]
        if (first.ProductId && first.RecommendedId) {
            return true
        }
        return false
    }

    private async parsePromise(body: any): Promise<string[][]> {
        try {
            const output = await this._parsePromise(body, { delimiter: "," })
            if (output.length >= 1 && output[0].length === 1) {
                throw new Error("Parse error when parsing with , delimiter - no content")
            }
            return output
        } catch (error) {
            const output = await this._parsePromise(body, { delimiter: ";" })
            // In case the fallback parsing only has one column, rethrow the original error
            if (output.length >= 1 && output[0].length === 1) {
                throw error
            }
            return output
        }
    }
    
    private async _parsePromise(body: any, options: any): Promise<string[][]> {
        return new Promise<string[][]>((resolve, reject) => {
            parse(body, options, (err: Error, output: any) => {
                if (err) {
                    reject(err)
                } else if (output) {
                    resolve(output)
                } else {
                    reject("Missing output")
                }
            })
        })
    }
}