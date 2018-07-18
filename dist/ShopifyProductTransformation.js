"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var htmlToText = __importStar(require("html-to-text"));
var ShopifyProductTransformation = /** @class */ (function () {
    function ShopifyProductTransformation() {
    }
    ShopifyProductTransformation.prototype.isDeletionRequest = function (headers, body) {
        var topic = headers["x-shopify-topic"];
        if (topic === "products/delete") {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    ShopifyProductTransformation.prototype.transformProduct = function (input) {
        var requiredFields = ["id", "title"];
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (!input[field]) {
                throw new Error("Missing field '" + field + "'");
            }
        }
        var product = {};
        product.id = "" + input.id;
        product.name = input.title;
        if (input.image && input.image.src) {
            product.image_url = input.image.src;
        }
        if (input.body_html) {
            product.description = htmlToText.fromString(input.body_html);
        }
        if (input.variants && Array.isArray(input.variants) && input.variants.length > 0) {
            var firstVariant = input.variants[0];
            if (firstVariant.price) {
                product.retail_price = Number(firstVariant.price);
            }
        }
        return product;
    };
    ShopifyProductTransformation.prototype.transformRepoProduct = function (input, channels, markets) {
        var product = this.transformProduct(input);
        var metadata = { markets: {}, channels: {} };
        for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
            var channel = channels_1[_i];
            metadata.channels[channel] = true;
        }
        for (var _a = 0, markets_1 = markets; _a < markets_1.length; _a++) {
            var market = markets_1[_a];
            metadata.markets[market] = true;
        }
        var obj = { product: product, metadata: metadata };
        return obj;
    };
    ShopifyProductTransformation.prototype.productIdForDeletion = function (input) {
        var requiredFields = ["id"];
        for (var _i = 0, requiredFields_2 = requiredFields; _i < requiredFields_2.length; _i++) {
            var field = requiredFields_2[_i];
            if (!input[field]) {
                throw new Error("Missing field '" + field + "'");
            }
        }
        return input.id;
    };
    return ShopifyProductTransformation;
}());
exports.ShopifyProductTransformation = ShopifyProductTransformation;
