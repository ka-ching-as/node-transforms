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
    productIdForDeletion(input) {
        const requiredFields = ["id"];
        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`);
            }
        }
        return input.id;
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
        const isSimpleProduct = this.isSimpleProduct(input);
        console.log("IS SIMPLE", isSimpleProduct);
        if (isSimpleProduct) {
            this.transformAsSimpleProduct(input, product);
        }
        else {
            this.transformAsVariantProduct(input, product);
        }
        return product;
    }
    transformAsSimpleProduct(input, product) {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : [];
        if (variants.length > 0) {
            const firstVariant = variants[0];
            if (firstVariant.price === undefined) {
                throw new Error(`Missing field 'price'`);
            }
            else {
                product.retail_price = Number(firstVariant.price);
            }
        }
    }
    transformAsVariantProduct(input, product) {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : [];
        const options = (input.options && Array.isArray(input.options)) ? input.options : [];
        const resultDimensions = [];
        const dimensionValueLookup = {};
        const dimensionLookup = {};
        const variantImages = {};
        const images = (input.images && Array.isArray(input.images)) ? input.images : [];
        for (const image of images) {
            const url = image.src;
            for (const variantId of image.variant_ids) {
                const idString = `${variantId}`;
                // Let the first image win
                if (variantImages[idString] === undefined) {
                    variantImages[idString] = url;
                }
            }
        }
        let dimensionCount = 1;
        for (const option of options) {
            const dimension = {};
            dimension.id = `${option.id}`;
            dimension.name = option.name;
            const dimensionValues = [];
            const valueLookup = {};
            let valueCount = 1;
            for (const value of option.values) {
                const dimensionValue = {};
                dimensionValue.id = `${valueCount}`;
                dimensionValue.name = value;
                dimensionValues.push(dimensionValue);
                valueLookup[value] = dimensionValue.id;
                valueCount++;
            }
            const optionKey = `option${dimensionCount}`;
            dimensionValueLookup[optionKey] = valueLookup;
            dimensionLookup[optionKey] = dimension.id;
            resultDimensions.push(dimension);
            dimensionCount++;
        }
        if (resultDimensions.length > 0) {
            product.dimensions = resultDimensions;
        }
        const resultVariants = [];
        for (const variantInput of variants) {
            const variant = {};
            const requiredFields = ["id", "price"];
            for (const field of requiredFields) {
                if (!variantInput[field]) {
                    throw new Error(`Missing field '${field}'`);
                }
            }
            variant.id = `${variantInput.id}`;
            variant.retail_price = Number(variantInput.price);
            // It appears that variant titles are always composed
            // of their 'option' values. This is also the default
            // when leaving the name blank in Ka-ching and using options
            // So we leave it blank if there are options
            if (variantInput.option1 === null || variantInput.option1 === undefined) {
                if (variantInput.title) {
                    variant.name = variantInput.title;
                }
            }
            const dimensionValues = {};
            for (const optionKey of ["option1", "option2", "option3"]) {
                if (variantInput[optionKey] !== null && variantInput[optionKey] !== undefined) {
                    const valueLookup = dimensionValueLookup[optionKey];
                    if (!valueLookup) {
                        continue;
                    }
                    const valueId = valueLookup[variantInput[optionKey]];
                    if (valueId === null || valueId === undefined) {
                        continue;
                    }
                    const dimensionId = dimensionLookup[optionKey];
                    if (dimensionId === null || dimensionId === undefined) {
                        continue;
                    }
                    dimensionValues[dimensionId] = valueId;
                }
            }
            if (Object.keys(dimensionValues).length > 0) {
                variant.dimension_values = dimensionValues;
            }
            if (variantImages[variant.id]) {
                variant.image_url = variantImages[variant.id];
            }
            resultVariants.push(variant);
        }
        product.variants = resultVariants;
    }
    // We define the product to be a simple product (without variants) if there are at most one
    // variant or option or option value.
    isSimpleProduct(input) {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : [];
        if (variants.length > 1) {
            return false;
        }
        const options = (input.options && Array.isArray(input.options)) ? input.options : [];
        if (options.length > 1) {
            return false;
        }
        if (options.length === 1) {
            const first = options[0];
            const values = (first && Array.isArray(first)) ? first : [];
            if (values.length > 1) {
                return false;
            }
        }
        return true;
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
}
exports.ShopifyProductTransformation = ShopifyProductTransformation;
