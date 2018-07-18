import { HttpHeaders, ProductTransformation } from "./ProductTransformation";
export declare class KachingProductTransformation implements ProductTransformation {
    constructor();
    isDeletionRequest(headers: HttpHeaders, body: any): boolean;
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>;
    productIdForDeletion(input: any): string;
}
