import * as express from "express"
import * as _ from "lodash"
import { RecommendationTransformation, ProductRecommendation } from "./RecommendationTransformation"

export class KachingRecommendationTransformation implements RecommendationTransformation {

    canHandleRequest(request: express.Request): boolean {
        return !_.isNil(request.body.products)
    }

    /* Example data
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
       await callback(_.cloneDeep(input))
   }
}