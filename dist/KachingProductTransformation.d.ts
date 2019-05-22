import * as express from "express";
import { ProductTransformation } from "./ProductTransformation";
export declare class KachingProductTransformation implements ProductTransformation {
    isDeletionRequest(request: express.Request): boolean;
    productIdsForDeletion(request: express.Request): string[];
    transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>): Promise<void>;
}
