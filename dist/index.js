"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Shopify = __importStar(require("./ShopifyProductTransformation"));
var Kaching = __importStar(require("./KachingProductTransformation"));
exports.ShopifyProductTransformation = Shopify;
exports.KachingProductTransformation = Kaching;
