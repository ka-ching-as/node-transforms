"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-import-side-effect
require("cross-fetch/polyfill");
const _ = __importStar(require("lodash"));
class ShopifyStockTransformation {
    async transformToStockImportData(input, configuration) {
        console.info(`Transforming Shopify inventory level update: ${JSON.stringify(input)}`);
        if (!this.validateInput(input)) {
            console.error(`Shopify stock input not valid: ${JSON.stringify(input)}`);
            return undefined;
        }
        const inventoryLevelUpdate = input;
        const stockLocationId = configuration.stock_location_map[`${inventoryLevelUpdate.location_id}`];
        if (!stockLocationId) {
            console.error(`Unknown location id: ${inventoryLevelUpdate.location_id}`);
            return undefined;
        }
        try {
            const queueElement = this.stockQueueElement(inventoryLevelUpdate, stockLocationId);
            console.info(`Resulting stock queue element: ${JSON.stringify(queueElement)}`);
            return queueElement;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
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
    stockQueueElement(inventoryLevelUpdate, stockLocationId) {
        const result = {};
        result.count = inventoryLevelUpdate.available;
        result.location_id = stockLocationId;
        result.product_id = inventoryLevelUpdate.product_id;
        if (inventoryLevelUpdate.variant_id !== undefined) {
            result.variant_id = inventoryLevelUpdate.variant_id;
        }
        return result;
    }
}
exports.ShopifyStockTransformation = ShopifyStockTransformation;
