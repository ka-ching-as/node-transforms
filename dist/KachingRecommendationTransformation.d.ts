import * as express from "express";
import { RecommendationTransformation, RecommendationQueueEntry } from "./RecommendationTransformation";
export declare class KachingRecommendationTransformation implements RecommendationTransformation {
    canHandleRequest(request: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void>;
}
