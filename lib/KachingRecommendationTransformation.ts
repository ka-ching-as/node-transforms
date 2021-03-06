import * as express from "express"
import * as _ from "lodash"
import { RecommendationTransformation, ProductRecommendation } from "./RecommendationTransformation"

export class KachingRecommendationTransformation implements RecommendationTransformation {

    // This is "best effort" - moving forward we should transition clients to specify the transform as a query parameter
    canHandleRequest(request: express.Request): boolean {
        return !_.isNil(request.body.products) || !_.isNil(request.body.product_id)
    }

    /* 
    Example data single
    {
        integration_id: "similar",
        product_id: "abc",
        recommendations: ["xyz", "123"]
    }
    Example data multiple
    {
        "products": [
            {
                "product_id": "-L6QZDxE6JJb9ifQAay5",
                "recommendations": ["-L6Q_LjeIwMbW7w-MU6T"]
            }
        ]
    }
    */
   async transformToRecommendationImportData(input: any, callback: (productRecommendation?: ProductRecommendation) => Promise<void>): Promise<void> {
        if (_.isNil(input.product_id)) {
            for (const product of input.products) {
                await callback(product)
            }
        } else {
            const result = {
                product_id: input.product_id,
                recommendations: input.recommendations
            }
            await callback(result)
        }
   }
}