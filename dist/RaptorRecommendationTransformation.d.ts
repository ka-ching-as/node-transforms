import * as express from "express";
import { RecommendationTransformation, RecommendationQueueEntry } from "./RecommendationTransformation";
export declare class RaptorRecommendationTransformation implements RecommendationTransformation {
    canHandleRequest(request: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (recommendationQueueElement?: RecommendationQueueEntry) => Promise<void>): Promise<void>;
    private transformCSVToRecommendationImportData;
    private transformJSONToRecommendationImportData;
    private isRaptorJSONFormat;
    private parsePromise;
    private _parsePromise;
}
