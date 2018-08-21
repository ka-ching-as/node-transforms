import * as express from "express"

export interface ProductTransformation {
    isDeletionRequest(request: express.Request): boolean
    productIdsForDeletion(request: express.Request): string[]
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>
}