"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const htmlToText = __importStar(require("html-to-text"));
class ShopifyProductTransformation {
    constructor() { }
    isDeletionRequest(headers, body) {
        const topic = headers["x-shopify-topic"];
        if (topic === "products/delete") {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input) {
        const requiredFields = ["id", "title"];
        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`);
            }
        }
        const product = {};
        product.id = `${input.id}`;
        product.name = input.title;
        if (input.image && input.image.src) {
            product.image_url = input.image.src;
        }
        if (input.body_html) {
            product.description = htmlToText.fromString(input.body_html);
        }
        if (input.variants && Array.isArray(input.variants) && input.variants.length > 0) {
            const firstVariant = input.variants[0];
            if (firstVariant.price) {
                product.retail_price = Number(firstVariant.price);
            }
        }
        return product;
    }
    transformRepoProduct(input, defaultChannels, defaultMarkets, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = this.transformProduct(input);
            const metadata = { markets: {}, channels: {} };
            for (const channel of defaultChannels) {
                metadata.channels[channel] = true;
            }
            for (const market of defaultMarkets) {
                metadata.markets[market] = true;
            }
            const obj = { product: product, metadata: metadata };
            yield callback(obj);
        });
    }
    productIdForDeletion(input) {
        const requiredFields = ["id"];
        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`);
            }
        }
        return input.id;
    }
}
exports.ShopifyProductTransformation = ShopifyProductTransformation;
