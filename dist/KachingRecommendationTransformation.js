"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class KachingRecommendationTransformation {
    canHandleRequest(request) {
        return !_.isNil(request.body.products);
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
    async transformToRecommendationImportData(input, callback) {
        await callback(_.cloneDeep(input));
    }
}
exports.KachingRecommendationTransformation = KachingRecommendationTransformation;
