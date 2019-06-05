import * as express from "express";
export interface RecommendationQueueEntry {
    product_id: string;
    recommendations: string[];
}
export interface RecommendationTransformation {
    canHandleRequest(req: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void>;
}
