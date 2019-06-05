"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
class KachingRecommendationTransformation {
    // This is "best effort" - moving forward we should transition clients to specify the transform as a query parameter
    canHandleRequest(request) {
        return !_.isNil(request.body.products) || !_.isNil(request.body.product_id);
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
    async transformToRecommendationImportData(input, callback) {
        if (_.isNil(input.product_id)) {
            for (const product of input.products) {
                await callback(product);
            }
        }
        else {
            const result = {
                product_id: input.product_id,
                recommendations: input.recommendations
            };
            await callback(result);
        }
    }
}
exports.KachingRecommendationTransformation = KachingRecommendationTransformation;
