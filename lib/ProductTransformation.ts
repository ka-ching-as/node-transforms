export interface HttpHeaders {
    [header: string]: string | string[];
}

export interface ProductTransformation {
    isDeletionRequest(headers: HttpHeaders, body: any): boolean
    productIdForDeletion(input: any): string
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>
}