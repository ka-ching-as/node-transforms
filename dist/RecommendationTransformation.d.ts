import * as express from "express";
export interface ProductRecommendation {
    product_id: string;
    recommendations: string[];
}
export interface RecommendationTransformation {
    canHandleRequest(req: express.Request): boolean;
    transformToRecommendationImportData(input: any, callback: (productRecommendation?: ProductRecommendation) => Promise<void>): Promise<void>;
}
