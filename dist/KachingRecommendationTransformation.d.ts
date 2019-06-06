import * as express from "express";
import { RecommendationTransformation, ProductRecommendation } from "./RecommendationTransformation";
export declare class KachingRecommendationTransformation implements RecommendationTransformation {
    canHandleRequest(request: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (productRecommendation?: ProductRecommendation) => Promise<void>): Promise<void>;
}
