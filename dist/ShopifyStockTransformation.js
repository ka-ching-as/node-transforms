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
// tslint:disable-next-line:no-import-side-effect
require("cross-fetch/polyfill");
const _ = require("lodash");
const path = require("path");
const apollo_boost_1 = require("apollo-boost");
class ShopifyStockTransformation {
    transformToStockImportData(input, configuration, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`Transforming Shopify inventory level update: ${JSON.stringify(input)}`);
            if (!this.validateInput(input)) {
                console.error(`Shopify stock input not valid: ${JSON.stringify(input)}`);
                yield callback(undefined);
                return;
            }
            const inventoryLevelUpdate = input;
            const stockLocationId = configuration.stock_location_map[`${inventoryLevelUpdate.location_id}`];
            if (!stockLocationId) {
                console.error(`Unknown location id: ${inventoryLevelUpdate.location_id}`);
                yield callback(undefined);
                return;
            }
            const shopifyId = configuration.shopify_id;
            if (!shopifyId || typeof shopifyId !== "string") {
                console.error(`Missing or invalid shopify id on configuration ${JSON.stringify(configuration)}`);
                yield callback(undefined);
                return;
            }
            const accessToken = configuration.shopify_access_token;
            if (!accessToken || typeof accessToken !== "string") {
                console.error(`Missing or invalid shopify access token on configuration ${JSON.stringify(configuration)}`);
                yield callback(undefined);
                return;
            }
            const client = new apollo_boost_1.default({
                uri: `https://${shopifyId}.myshopify.com/admin/api/2019-04/graphql.json`,
                request: (operation) => __awaiter(this, void 0, void 0, function* () {
                    operation.setContext({
                        headers: {
                            "X-Shopify-Access-Token": accessToken,
                        }
                    });
                })
            });
            const query = apollo_boost_1.gql `{
            inventoryItem(id: "gid://shopify/InventoryItem/${inventoryLevelUpdate.inventory_item_id}") {
              variant {
                id,
                product {
                  id,
                  totalVariants
                }
              }
            }
          }`;
            try {
                const result = yield client.query({
                    query: query
                });
                if (!this.validateQueryResultData(result.data)) {
                    console.error(`Invalid result data from GraphQL query: ${JSON.stringify(query)}, result: ${JSON.stringify(result)}`);
                    yield callback(undefined);
                    return;
                }
                const queueElement = this.stockQueueElement(inventoryLevelUpdate, result.data, stockLocationId);
                console.info(`Resulting stock queue element: ${JSON.stringify(queueElement)}`);
                callback(queueElement);
            }
            catch (error) {
                console.log(error);
                callback(undefined);
                return;
            }
        });
    }
    /* Example structure
    {
    "inventory_item_id": 17864432713779,
    "location_id": 15312158771,
    "available": 0,
    "updated_at": "2019-04-11T13:12:26-04:00",
    "admin_graphql_api_id": "gid://shopify/InventoryLevel/14943944755?inventory_item_id=17864432713779"
    } */
    validateInput(input) {
        if (_.isNil(input) || !_.isObject(input)) {
            return false;
        }
        const inventoryIdValid = input.inventory_item_id && typeof (input.inventory_item_id) === "number";
        const locationIdValid = input.location_id && typeof (input.location_id) === "number";
        const availableValid = input.available !== undefined && typeof (input.available) === "number";
        return inventoryIdValid && locationIdValid && availableValid;
    }
    /* Example structure
    {
        "inventoryItem": {
            "variant": {
                "id": "gid://shopify/ProductVariant/17280150601779",
                "product": {
                    "id": "gid://shopify/Product/1863678132275",
                    "totalVariants": 1,
                    "__typename": "Product"
                },
                "__typename": "ProductVariant"
            },
            "__typename": "InventoryItem"
        }
    } */
    validateQueryResultData(data) {
        if (_.isNil(data) || !_.isObject(data)) {
            return false;
        }
        const inventoryItemExist = data.inventoryItem && typeof (data.inventoryItem) === "object";
        const variantExist = data.inventoryItem.variant && typeof (data.inventoryItem.variant) === "object";
        const productExist = data.inventoryItem.variant.product && typeof (data.inventoryItem.variant.product) === "object";
        const totalVariantsIsValid = data.inventoryItem.variant.product.totalVariants && typeof (data.inventoryItem.variant.product.totalVariants) === "number";
        return inventoryItemExist && variantExist && productExist && totalVariantsIsValid;
    }
    stockQueueElement(inventoryLevelUpdate, resultData, stockLocationId) {
        const result = {};
        result.count = inventoryLevelUpdate.available;
        result.location_id = stockLocationId;
        result.product_id = path.basename(resultData.inventoryItem.variant.product.id);
        if (resultData.inventoryItem.variant.product.totalVariants > 1) {
            result.variant_id = path.basename(resultData.inventoryItem.variant.id);
        }
        return result;
    }
}
exports.ShopifyStockTransformation = ShopifyStockTransformation;
