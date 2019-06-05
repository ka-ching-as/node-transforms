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
const parse = require("csv-parse");
class RaptorRecommendationTransformation {
    // Until we require explicit transform param in the query string we have to do this. We did the same before, just in the functions project.
    canHandleRequest(request) {
        const contentType = request.get("Content-Type");
        if (contentType.includes("application/json")) {
            return this.isRaptorJSONFormat(request.body);
        }
        else if (contentType.includes("text/csv")) {
            return true;
        }
        return false;
    }
    transformToRecommendationImportData(input, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRaptorJSONFormat(input)) {
                yield this.transformJSONToRecommendationImportData(input, callback);
            }
            else {
                yield this.transformCSVToRecommendationImportData(input, callback);
            }
        });
    }
    /* Example data
    RecommendedId;Priority;ProductID
    -L6Q_LjeIwMbW7w-MU6T;1;-L6QZDxE6JJb9ifQAay5
    */
    transformCSVToRecommendationImportData(input, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.parsePromise(input);
            let fields = [];
            let product = undefined;
            for (const entry of output) {
                if (fields.length === 0) {
                    fields = entry;
                    continue;
                }
                let productId = undefined;
                let recommendedId = undefined;
                for (const index in entry) {
                    const value = entry[index];
                    const key = fields[index];
                    if (key === "ProductID") {
                        productId = value;
                    }
                    else if (key === "RecommendedId") {
                        recommendedId = value;
                    }
                }
                if (productId === undefined || recommendedId === undefined) {
                    continue;
                }
                const existingProductId = (product || {}).product_id;
                if (productId !== existingProductId) {
                    // Add product to updates and reset product
                    if (product !== undefined) {
                        yield callback(product);
                    }
                    product = { product_id: productId };
                }
                product.recommendations = (product.recommendations || []);
                product.recommendations.push(recommendedId);
            }
            if (product !== undefined && product.recommendations !== undefined) {
                yield callback(product);
            }
        });
    }
    /* Example data
    [ { "ProductId": "-L6QZDxE6JJb9ifQAay5", "Priority": "1", "RecommendedId": "-L6Q_LjeIwMbW7w-MU6T" }]
    */
    transformJSONToRecommendationImportData(input, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(input)) {
                throw new Error("Expecting an array");
            }
            const array = input;
            let product = undefined;
            for (const entry of array) {
                const productId = entry.ProductId;
                const recommendedId = entry.RecommendedId;
                if (productId === undefined || recommendedId === undefined) {
                    continue;
                }
                const existingProductId = (product || {}).product_id;
                if (productId !== existingProductId) {
                    // Add product to updates and reset product
                    if (product !== undefined) {
                        yield callback(product);
                    }
                    product = { product_id: productId };
                }
                product.recommendations = (product.recommendations || []);
                product.recommendations.push(recommendedId);
            }
            if (product !== undefined && product.recommendations !== undefined) {
                yield callback(product);
            }
        });
    }
    isRaptorJSONFormat(input) {
        if (!Array.isArray(input)) {
            return false;
        }
        const array = input;
        if (array.length === 0) {
            return false;
        }
        const first = array[0];
        if (first.ProductId && first.RecommendedId) {
            return true;
        }
        return false;
    }
    parsePromise(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield this._parsePromise(body, { delimiter: "," });
                if (output.length >= 1 && output[0].length === 1) {
                    throw new Error("Parse error when parsing with , delimiter - no content");
                }
                return output;
            }
            catch (error) {
                const output = yield this._parsePromise(body, { delimiter: ";" });
                // In case the fallback parsing only has one column, rethrow the original error
                if (output.length >= 1 && output[0].length === 1) {
                    throw error;
                }
                return output;
            }
        });
    }
    _parsePromise(body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                parse(body, options, (err, output) => {
                    if (err) {
                        reject(err);
                    }
                    else if (output) {
                        resolve(output);
                    }
                    else {
                        reject("Missing output");
                    }
                });
            });
        });
    }
}
exports.RaptorRecommendationTransformation = RaptorRecommendationTransformation;
