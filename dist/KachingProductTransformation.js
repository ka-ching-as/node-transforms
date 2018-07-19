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
class KachingProductTransformation {
    constructor() { }
    // We do not (yet) support deletion through the native Ka-ching format 
    isDeletionRequest(headers, body) {
        return false;
    }
    productIdForDeletion(input) {
        throw new Error("Internal error - deletion is not supported through the native format");
    }
    transformRepoProduct(input, defaultChannels, defaultMarkets, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (input.product) {
                yield callback(input);
            }
            else if (input.products) {
                for (const key in input.products) {
                    const product = input.products[key];
                    const obj = { product: product };
                    if (input.metadata) {
                        obj["metadata"] = input.metadata;
                    }
                    if (input.shops) {
                        obj["shops"] = input.shops;
                    }
                    yield callback(obj);
                }
            }
            else {
                throw new Error("Bad request - missing product or products key in body.");
            }
        });
    }
}
exports.KachingProductTransformation = KachingProductTransformation;
