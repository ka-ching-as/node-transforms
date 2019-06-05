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
class KachingStockTransformation {
    transformToStockImportData(input, configuration, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const locationId in input) {
                const products = input[locationId];
                for (const productId in products) {
                    const product = products[productId];
                    if (typeof product === "number") {
                        const entry = {};
                        entry.count = product;
                        entry.location_id = locationId;
                        entry.product_id = productId;
                        yield callback(entry);
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
                            yield callback(entry);
                        }
                    }
                }
            }
        });
    }
}
exports.KachingStockTransformation = KachingStockTransformation;
