import * as express from "express";
import { RecommendationTransformation, ProductRecommendation } from "./RecommendationTransformation";
export declare class RaptorRecommendationTransformation implements RecommendationTransformation {
    canHandleRequest(request: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (productRecommendation?: ProductRecommendation) => Promise<void>): Promise<void>;
    private transformCSVToRecommendationImportData;
    private transformJSONToRecommendationImportData;
    private isRaptorJSONFormat;
    private parsePromise;
    private _parsePromise;
}
