import { HttpHeaders, ProductTransformation } from "./ProductTransformation";
export declare class ShopifyProductTransformation implements ProductTransformation {
    isDeletionRequest(headers: HttpHeaders, body: any): boolean;
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input: any): any;
    transformRepoProduct(input: any, channels: string[], markets: string[]): any;
    productIdForDeletion(input: any): string;
}
