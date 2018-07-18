import { HttpHeaders, ProductTransformation } from "./ProductTransformation";
export declare class ShopifyProductTransformation implements ProductTransformation {
    constructor();
    isDeletionRequest(headers: HttpHeaders, body: any): boolean;
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input: any): any;
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>;
    productIdForDeletion(input: any): string;
}
