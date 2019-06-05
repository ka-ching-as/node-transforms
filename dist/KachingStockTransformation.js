"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class KachingStockTransformation {
    async transformToStockImportData(input, configuration, callback) {
        for (const locationId in input) {
            const products = input[locationId];
            for (const productId in products) {
                const product = products[productId];
                if (typeof product === "number") {
                    const entry = {};
                    entry.count = product;
                    entry.location_id = locationId;
                    entry.product_id = productId;
                    await callback(entry);
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
                        await callback(entry);
                    }
                }
            }
        }
    }
}
exports.KachingStockTransformation = KachingStockTransformation;
