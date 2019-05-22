import * as express from "express";
import { ProductTransformation } from "./ProductTransformation";
export declare class ShopifyProductTransformation implements ProductTransformation {
    isDeletionRequest(request: express.Request): boolean;
    productIdsForDeletion(request: express.Request): string[];
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input: any): any;
    transformAsSimpleProduct(input: any, product: any): void;
    transformAsVariantProduct(input: any, product: any): void;
    isSimpleProduct(input: any): boolean;
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>;
}
