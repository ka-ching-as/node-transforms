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
class KachingStockTransformation {
    async transformToStockImportData(input, configuration) {
        for (const locationId in input) {
            const products = input[locationId];
            for (const productId in products) {
                const product = products[productId];
                if (typeof product === "number") {
                    const entry = {};
                    entry.count = product;
                    entry.location_id = locationId;
                    entry.product_id = productId;
                    return entry;
                }
                else if (_.isObject(product)) {
                    for (const variantId in product) {
                        const variantCount = product[variantId];
                        if (typeof variantCount !== "number") {
                            console.warn(`Invalid kaching stock import product object: ${JSON.stringify(product)}`);
                            continue;
                        }
                        const entry = {};
                        entry.count = variantCount;
                        entry.location_id = locationId;
                        entry.product_id = productId;
                        entry.variant_id = variantId;
                        return entry;
                    }
                }
            }
        }
    }
}
exports.KachingStockTransformation = KachingStockTransformation;
