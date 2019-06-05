"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    transformToRecommendationImportData(input, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield callback(_.cloneDeep(input));
        });
    }
}
exports.KachingRecommendationTransformation = KachingRecommendationTransformation;
