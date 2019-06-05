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
